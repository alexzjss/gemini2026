// docs/07 §2 — afinidades do Da Galera
import type { AffinityAxis, AffinityProfile, Scenario } from "../types";
import { EIXOS, LIMIARES } from "../config";
import { AXES, perfilVazio } from "./util";

export interface Frase { eixos: [AffinityAxis, AffinityAxis]; frase: string }

export function perfil(respostas: Record<string, string>, cenarios: Scenario[]): AffinityProfile {
  const bruto = perfilVazio();
  const max = perfilVazio();
  for (const c of cenarios) {
    const key = respostas[c.id];
    if (!key) continue;
    const escolhida = c.opcoes.find((o) => o.key === key);
    if (!escolhida) continue;
    for (const eixo of AXES) {
      bruto[eixo] += escolhida.pesos[eixo] ?? 0;
      max[eixo] += Math.max(0, ...c.opcoes.map((o) => o.pesos[eixo] ?? 0));
    }
  }
  const p = perfilVazio();
  for (const eixo of AXES) p[eixo] = max[eixo] ? Math.round((100 * bruto[eixo]) / max[eixo]) : 0;
  return p;
}

/** Perfil parcial ("Até agora você curte"): só a partir do 3º cenário respondido. */
export function perfilParcial(respostas: Record<string, string>, cenarios: Scenario[]): AffinityProfile | null {
  const n = cenarios.filter((c) => respostas[c.id]).length;
  return n >= 3 ? perfil(respostas, cenarios) : null;
}

export function rotulo(v: number): "forte" | "médio" | "leve" {
  if (v >= LIMIARES.afinidade.forte) return "forte";
  if (v >= LIMIARES.afinidade.medio) return "médio";
  return "leve";
}

export function labelEixo(eixo: AffinityAxis): string {
  return EIXOS.find((e) => e.id === eixo)?.label ?? eixo;
}

/** Os n maiores eixos (empate pela ordem fixa dos eixos). */
export function top(p: AffinityProfile, n: number): { eixo: AffinityAxis; valor: number; rotulo: string }[] {
  return [...AXES]
    .map((eixo, i) => ({ eixo, valor: p[eixo], i }))
    .sort((a, b) => b.valor - a.valor || a.i - b.i)
    .slice(0, n)
    .map(({ eixo, valor }) => ({ eixo, valor, rotulo: rotulo(valor) }));
}

export function fraseTitulo(p: AffinityProfile, frases: Frase[]): string {
  const [a, b] = top(p, 2).map((t) => t.eixo);
  const f = frases.find((x) => x.eixos.includes(a) && x.eixos.includes(b));
  return f?.frase ?? "Você tem um jeito só seu de curtir as coisas.";
}

export function respondidos(respostas: Record<string, string>, cenarios: Scenario[]): number {
  return cenarios.filter((c) => respostas[c.id]).length;
}
