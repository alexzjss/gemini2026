import { generateJson } from "@/lib/ai/gemini";
import { buildGaleraPrompt } from "@/lib/ai/prompts/galera";
import { systemAluno } from "@/lib/ai/prompts/system";
import { cortar, minuscula, rotaIA, termo } from "@/lib/ai/rota";
import {
  galeraInput,
  galeraOutput,
  galeraSchema,
  type GaleraData,
  type GaleraInput,
  type GaleraOutput,
} from "@/lib/ai/schemas";
import { careerById } from "@/lib/ai/seed";
import { verificarObjeto } from "@/lib/ai/guardrails";
import { getFallback, preencher } from "@/lib/fallbacks";
import type { AffinityAxis } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

interface GaleraFallback {
  porQueCombina: Record<string, string>;
  destravarTexto: string;
  /** Frase para carreiras sem texto próprio. Variáveis: {combina}, {carreira}. */
  modelo: string;
}

/** "futebol + números": os 2 eixos com maior perfil × afinidade da carreira (só para texto offline). */
function combina(i: GaleraInput, careerId: string): string {
  const c = careerById(careerId);
  if (!c) return "o seu perfil";
  const eixos = (Object.keys(c.affinity) as AffinityAxis[])
    .map((e) => ({ e, v: (i.perfil[e] ?? 0) * (c.affinity[e] ?? 0) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 2)
    .map(({ e }) => c.combinaCom[e])
    .filter(Boolean);
  return eixos.length ? eixos.join(" + ") : "o seu perfil";
}

function fallbackBase(i: GaleraInput): GaleraFallback {
  const carreira1 = i.top4[0]?.nome ?? "essas carreiras";
  return preencher(getFallback<GaleraFallback>("galera", [i.studentId]).data, {
    termo: termo(i.destravar.descricaoJovem),
    carreira1: minuscula(carreira1),
  });
}

function completar(i: GaleraInput, d: GaleraOutput): GaleraOutput {
  const fb = fallbackBase(i);
  const daIA = new Map(d.porQueCombina.map((p) => [p.id, p.frase]));
  return {
    porQueCombina: i.top4.map((t) => ({
      id: t.id,
      frase: cortar(
        daIA.get(t.id) ??
          fb.porQueCombina[t.id] ??
          preencher(fb.modelo, { combina: combina(i, t.id), carreira: minuscula(t.nome) }),
        120,
      ),
    })),
    destravarTexto: cortar(d.destravarTexto, 140),
  };
}

function fallback(i: GaleraInput): GaleraOutput {
  const fb = fallbackBase(i);
  return { porQueCombina: [], destravarTexto: fb.destravarTexto };
}

const paraData = (d: GaleraOutput): GaleraData => ({
  porQueCombina: Object.fromEntries(d.porQueCombina.map((p) => [p.id, p.frase])),
  destravarTexto: d.destravarTexto,
});

export const POST = rotaIA({
  nome: "galera",
  input: galeraInput,
  run: async (i, ctx) => {
    const r = await generateJson({
      rota: "galera",
      deadline: ctx.deadline,
      validar: (d) => verificarObjeto(d),
      system: systemAluno,
      user: buildGaleraPrompt(i, i.top4.map((t) => careerById(t.id))),
      responseSchema: galeraSchema,
      zod: galeraOutput,
      temperature: 0.6,
      fallback: () => fallback(i),
      postprocess: (d) => completar(i, d),
    });
    return { data: paraData(r.data), source: r.source };
  },
  emErro: (i) => ({ data: paraData(completar(i, fallback(i))), source: "fallback" }),
});
