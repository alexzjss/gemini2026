import { generateJson } from "@/lib/ai/gemini";
import { buildDiagnosticoPrompt } from "@/lib/ai/prompts/diagnostico";
import { systemAluno } from "@/lib/ai/prompts/system";
import { cortar, rotaIA, termo } from "@/lib/ai/rota";
import {
  diagnosticoInput,
  diagnosticoOutput,
  diagnosticoSchema,
  type DiagnosticoInput,
  type DiagnosticoOutput,
} from "@/lib/ai/schemas";
import { verificarObjeto } from "@/lib/ai/guardrails";
import { getFallback, preencher } from "@/lib/fallbacks";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

/** Variáveis do fallback `default` (frases montadas a partir das habilidades enviadas). */
function variaveis(i: DiagnosticoInput) {
  const desc = (l: DiagnosticoInput["skills"][number]["level"]) =>
    i.skills.filter((s) => s.level === l).map((s) => termo(s.descricaoJovem));
  const dom = desc("dominada");
  const emDes = desc("em_desenvolvimento");
  const destravar = [...desc("defasagem"), ...emDes];
  const n = dom.length;
  return {
    abertura: n
      ? `Você já domina ${n} habilidade${n > 1 ? "s" : ""}, como ${dom[0]}.`
      : `Você já está em movimento em ${emDes[0] ?? destravar[0] ?? "várias habilidades"}.`,
    destaque1: dom[0] ? `Você manda bem em ${dom[0]}.` : `Você já começou a evoluir em ${emDes[0] ?? "várias frentes"}.`,
    destaque2: dom[1]
      ? `${dom[1][0].toUpperCase()}${dom[1].slice(1)} também já é seu ponto forte.`
      : "Cada missão que você termina conta como evolução.",
    dest1: destravar[0] ?? "uma habilidade nova",
    passo1: destravar[0]
      ? `Destravar ${destravar[0]} abre caminho pra várias carreiras que você curtiu.`
      : "Escolha uma missão nova pra continuar subindo.",
    passo2: destravar[1]
      ? `Bora também em ${destravar[1]}: aparece no dia a dia de muita profissão.`
      : "Mantenha o ritmo das missões: é o esforço que destrava mentores.",
  };
}

function fallback(i: DiagnosticoInput): DiagnosticoOutput {
  return preencher(getFallback<DiagnosticoOutput>("diagnostico", [i.studentId]).data, variaveis(i));
}

const limpar = (d: DiagnosticoOutput): DiagnosticoOutput => ({
  resumo: cortar(d.resumo, 320),
  destaques: d.destaques.slice(0, 2).map((s) => cortar(s, 160)),
  proximosPassos: d.proximosPassos.slice(0, 2).map((s) => cortar(s, 180)),
});

export const POST = rotaIA({
  nome: "diagnostico",
  input: diagnosticoInput,
  run: (i, ctx) =>
    generateJson({
      rota: "diagnostico",
      deadline: ctx.deadline,
      validar: (d) => verificarObjeto(d),
      system: systemAluno,
      user: buildDiagnosticoPrompt(i),
      responseSchema: diagnosticoSchema,
      zod: diagnosticoOutput,
      temperature: 0.5,
      fallback: () => fallback(i),
      postprocess: limpar,
    }),
  emErro: (i) => ({ data: limpar(fallback(i)), source: "fallback" }),
});
