import { generateJson } from "@/lib/ai/gemini";
import { limparPII, removerNomes, verificarObjeto } from "@/lib/ai/guardrails";
import { buildPlanoPrompt } from "@/lib/ai/prompts/plano";
import { systemProfessor } from "@/lib/ai/prompts/system";
import { cortar, minuscula, rotaIA } from "@/lib/ai/rota";
import { planoInput, planoOutput, planoSchema, type PlanoInput, type PlanoOutput } from "@/lib/ai/schemas";
import { descricaoSkill, nomesAlunos } from "@/lib/ai/seed";
import { getFallback, normalizarChave, preencher } from "@/lib/fallbacks";
import { competenciaRef, retrieve, type Chunk } from "@/lib/rag/retriever";
import type { LessonPlan, SkillLevel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const QUERY_REFERENCIAL =
  "pensamento crítico, autonomia docente, uso ético e transparente de IA, equidade, supervisão humana";
const NIVEIS: SkillLevel[] = ["defasagem", "em_desenvolvimento", "dominada"];

const serieDaTurma = (classId: PlanoInput["classId"]) => Number(classId[0]);

/** Aceita percentuais ou contagens e devolve percentuais inteiros. */
function percentuais(i: PlanoInput) {
  const d = i.distribuicao;
  const soma = d.defasagem + d.em_desenvolvimento + d.dominada;
  if (!soma) return { defasagem: 0, em_desenvolvimento: 0, dominada: 0 };
  const saoContagens = Math.abs(soma - i.nAlunos) < Math.abs(soma - 100);
  const pct = (v: number) => Math.round(saoContagens ? (v / soma) * 100 : v);
  return { defasagem: pct(d.defasagem), em_desenvolvimento: pct(d.em_desenvolvimento), dominada: pct(d.dominada) };
}

/**
 * 4 BNCC (habilidade + competência + vizinhas acima do limiar) + 2 Referencial.
 * A habilidade, se existir no corpus, é sempre a [1].
 */
async function recuperar(i: PlanoInput): Promise<Chunk[]> {
  const [bncc, ref] = await Promise.all([
    retrieve(`${i.skillCode} ${descricaoSkill(i.skillCode)} ${i.interesse}`, {
      k: 4,
      sources: ["bncc"],
      relacionados: true,
      rotulo: "plano:bncc",
    }),
    retrieve(QUERY_REFERENCIAL, { k: 2, sources: ["referencial"], rotulo: "plano:referencial" }),
  ]);
  return [...bncc, ...ref];
}

/** Ajusta os minutos para somarem 50 (proporcional, arredondado; a diferença vai para a maior etapa). */
function ajustarMinutos(etapas: PlanoOutput["etapas"]): PlanoOutput["etapas"] {
  const soma = etapas.reduce((s, e) => s + e.minutos, 0);
  if (soma === 50 || !soma) return etapas;
  const novas = etapas.map((e) => ({ ...e, minutos: Math.max(1, Math.round((e.minutos / soma) * 50)) }));
  const dif = 50 - novas.reduce((s, e) => s + e.minutos, 0);
  const maior = novas.reduce((m, e, idx) => (e.minutos > novas[m].minutos ? idx : m), 0);
  novas[maior].minutos += dif;
  return novas;
}

/**
 * Os fallbacks escritos à mão citam por PAPEL: [1] habilidade, [2] competência específica,
 * [3]–[4] outras BNCC, [5]–[6] Referencial. Traduz para a numeração dos chunks realmente recuperados
 * (papel ausente → citação removida, nunca apontada para outro texto).
 */
function remapPorPapel(i: PlanoInput, chunks: Chunk[]) {
  const pos = (pred: (c: Chunk) => boolean) => {
    const n = chunks.findIndex(pred);
    return n >= 0 ? n + 1 : null;
  };
  const ce = competenciaRef(i.skillCode);
  const outrasBncc = chunks
    .map((c, n) => ({ c, n: n + 1 }))
    .filter(({ c }) => c.source === "bncc" && c.ref !== i.skillCode && c.ref !== ce)
    .map(({ n }) => n);
  const refs = chunks
    .map((c, n) => ({ c, n: n + 1 }))
    .filter(({ c }) => c.source === "referencial")
    .map(({ n }) => n);
  const mapa: Record<number, number | null> = {
    1: pos((c) => c.ref === i.skillCode),
    2: ce ? pos((c) => c.ref === ce) : null,
    3: outrasBncc[0] ?? null,
    4: outrasBncc[1] ?? null,
    5: refs[0] ?? null,
    6: refs[1] ?? null,
  };
  return (n: number) => mapa[n] ?? null;
}

/**
 * Pós-processamento (doc 06): citações fora do intervalo saem; `citacoes[]` é montado a partir
 * dos chunks recuperados (texto real, nunca o gerado); minutos somam 50; selo "atendido" só com
 * citação válida do Referencial; adaptação faltante vem do modelo offline.
 */
function montarPlano(
  i: PlanoInput,
  chunks: Chunk[],
  p: PlanoOutput,
  source: "ai" | "fallback",
  remap: (n: number) => number | null = (n) => n,
): LessonPlan {
  const valido = (n: number | undefined): number | undefined => {
    if (typeof n !== "number") return undefined;
    const m = remap(n);
    return m && m >= 1 && m <= chunks.length ? m : undefined;
  };
  const reserva = fallbackOutput(i);
  const adaptacoes = NIVEIS.map((nivel) => {
    const a = p.adaptacoes.find((x) => x.nivel === nivel)?.sugestao?.trim();
    return { nivel, sugestao: a || reserva.adaptacoes.find((x) => x.nivel === nivel)?.sugestao || "" };
  });
  return {
    id: `plano-${i.classId}-${i.skillCode}-${Date.now().toString(36)}`,
    classId: i.classId,
    skillCode: i.skillCode,
    interesse: i.interesse,
    titulo: cortar(p.titulo, 80),
    objetivo: p.objetivo,
    duracaoMin: 50,
    etapas: ajustarMinutos(p.etapas).map((e) => ({
      nome: e.nome,
      minutos: e.minutos,
      descricao: e.descricao,
      citacoes: [...new Set(e.citacoes.map(valido).filter((n): n is number => n !== undefined))].sort((a, b) => a - b),
    })),
    avaliacao: p.avaliacao,
    adaptacoes,
    citacoes: chunks.map((c, n) => ({ n: n + 1, chunkId: c.id, ref: c.ref, fonte: c.fonte, trecho: c.texto })),
    seloEtico: p.seloEtico.map((s) => {
      const citacao = valido(s.citacao);
      const doReferencial = citacao !== undefined && chunks[citacao - 1]?.source === "referencial";
      // O selo é uma sugestão da IA: só fica "atendido" com evidência do Referencial; o professor confirma.
      return {
        criterio: s.criterio,
        atendido: s.atendido && doReferencial && !!s.comoAtende.trim(),
        comoAtende: s.comoAtende,
        ...(citacao ? { citacao } : {}),
      };
    }),
    status: "rascunho",
    source,
    criadoEm: new Date().toISOString(),
  };
}

function fallbackOutput(i: PlanoInput): PlanoOutput {
  const chave = `${i.classId}:${i.skillCode}:${normalizarChave(i.interesse)}`;
  const pct = percentuais(i);
  return preencher(getFallback<PlanoOutput>("plano", [chave]).data, {
    skillCode: i.skillCode,
    interesse: i.interesse,
    descricao: minuscula(descricaoSkill(i.skillCode)),
    serie: serieDaTurma(i.classId),
    defasagem: pct.defasagem,
  });
}

export const POST = rotaIA({
  nome: "plano-aula",
  input: planoInput,
  run: async (i, ctx) => {
    const chunks = await recuperar(i);
    // Observações do professor: sem nomes de estudantes nem contatos (CLAUDE.md regra 4).
    const observacoes = i.notasProfessor ? limparPII(removerNomes(i.notasProfessor, nomesAlunos)) : undefined;
    let usouFallback = false;
    const r = await generateJson({
      rota: "plano-aula",
      deadline: ctx.deadline,
      system: systemProfessor,
      user: buildPlanoPrompt({ input: i, serie: serieDaTurma(i.classId), chunks, pct: percentuais(i), observacoes }),
      responseSchema: planoSchema,
      zod: planoOutput,
      temperature: 0.4,
      // Plano é para o professor: "e-mail" pode aparecer legitimamente; só barra vazamento de instruções.
      validar: (p) => verificarObjeto(p, { contato: false }),
      fallback: () => {
        usouFallback = true;
        return fallbackOutput(i);
      },
    });
    const plano = montarPlano(i, chunks, r.data, r.source, usouFallback ? remapPorPapel(i, chunks) : undefined);
    return { data: plano, source: r.source };
  },
  emErro: (i) => ({ data: montarPlano(i, [], fallbackOutput(i), "fallback"), source: "fallback" }),
});
