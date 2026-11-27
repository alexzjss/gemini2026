/* PROVISÓRIO (contrato 2 · dono: Agente 2). Regras de docs/07 §2. */
import { EIXOS_ORDEM, LIMIARES } from "@/lib/config";
import type { AffinityAxis, AffinityProfile, Scenario } from "@/lib/types";

export const perfilVazio = (): AffinityProfile => ({ analisar: 0, tech: 0, criar: 0, cuidar: 0, negocios: 0, esportes: 0 });

export function cosseno(a: AffinityProfile, b: AffinityProfile): number {
  let dot = 0, na = 0, nb = 0;
  for (const k of EIXOS_ORDEM) { dot += a[k] * b[k]; na += a[k] ** 2; nb += b[k] ** 2; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function perfil(respostas: Record<string, string>, cenarios: Scenario[]): AffinityProfile {
  const bruto = perfilVazio();
  const max = perfilVazio();
  for (const c of cenarios) {
    const key = respostas[c.id];
    if (!key) continue;
    for (const eixo of EIXOS_ORDEM) {
      max[eixo] += Math.max(0, ...c.opcoes.map((o) => o.pesos[eixo] ?? 0));
    }
    const op = c.opcoes.find((o) => o.key === key);
    if (op) for (const eixo of EIXOS_ORDEM) bruto[eixo] += op.pesos[eixo] ?? 0;
  }
  const out = perfilVazio();
  for (const eixo of EIXOS_ORDEM) out[eixo] = max[eixo] ? Math.round((100 * bruto[eixo]) / max[eixo]) : 0;
  return out;
}

export function rotulo(v: number): "forte" | "médio" | "leve" {
  if (v >= LIMIARES.afinidade.forte) return "forte";
  if (v >= LIMIARES.afinidade.medio) return "médio";
  return "leve";
}

export function top(p: AffinityProfile, n: number): { eixo: AffinityAxis; valor: number }[] {
  return EIXOS_ORDEM.map((eixo) => ({ eixo, valor: p[eixo] }))
    .sort((a, b) => b.valor - a.valor || EIXOS_ORDEM.indexOf(a.eixo) - EIXOS_ORDEM.indexOf(b.eixo))
    .slice(0, n);
}
