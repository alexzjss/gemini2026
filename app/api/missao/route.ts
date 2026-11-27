import { generateJson } from "@/lib/ai/gemini";
import { verificarObjeto } from "@/lib/ai/guardrails";
import { buildMissaoPrompt } from "@/lib/ai/prompts/missao";
import { systemAluno } from "@/lib/ai/prompts/system";
import { cortar, minuscula, rotaIA } from "@/lib/ai/rota";
import { missaoInput, quizOutput, quizSchema, type MissaoInput, type QuizOutput } from "@/lib/ai/schemas";
import { descricaoSkill } from "@/lib/ai/seed";
import { embaralhar } from "@/lib/ai/quiz";
import { getFallback, normalizarChave, preencher } from "@/lib/fallbacks";
import { retrieve } from "@/lib/rag/retriever";
import type { Quiz } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

type Correta = Quiz["questoes"][number]["correta"];

function fallback(i: MissaoInput): QuizOutput {
  const chaves = [`${i.skillCode}:${normalizarChave(i.interesse)}`, i.skillCode];
  return preencher(getFallback<QuizOutput>("missao", chaves).data, {
    interesse: i.interesse,
    skillCode: i.skillCode,
    descricao: minuscula(descricaoSkill(i.skillCode)),
  });
}

function paraQuiz(i: MissaoInput, q: QuizOutput, embaralha: boolean): Quiz {
  return {
    skillCode: i.skillCode,
    interesse: i.interesse,
    titulo: cortar(q.titulo, 70),
    questoes: q.questoes.map((x, n) => {
      const { alternativas, correta } = embaralha
        ? embaralhar(x, `${i.skillCode}:${normalizarChave(i.interesse)}:${n}`)
        : { alternativas: x.alternativas, correta: x.correta as Correta };
      return {
        id: `q${n + 1}`,
        enunciado: x.enunciado,
        alternativas: [alternativas[0], alternativas[1], alternativas[2], alternativas[3]],
        correta,
        explicacao: x.explicacao,
      };
    }),
  };
}

export const POST = rotaIA({
  nome: "missao",
  input: missaoInput,
  run: async (i, ctx) => {
    // Só o chunk exato da habilidade: contexto errado é pior que nenhum.
    const chunks = await retrieve(i.skillCode, { k: 1, sources: ["bncc"], exato: true, rotulo: "missao" });
    const r = await generateJson({
      rota: "missao",
      deadline: ctx.deadline,
      system: systemAluno,
      user: buildMissaoPrompt(i, chunks, descricaoSkill(i.skillCode)),
      responseSchema: quizSchema,
      zod: quizOutput,
      temperature: 0.7,
      validar: (q) => verificarObjeto(q),
      fallback: () => fallback(i),
    });
    // Fallbacks são revisados à mão e já têm posições variadas.
    return { data: paraQuiz(i, r.data, r.source === "ai"), source: r.source };
  },
  emErro: (i) => ({ data: paraQuiz(i, fallback(i), false), source: "fallback" }),
});
