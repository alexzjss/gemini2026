import type { AffinityAxis, Career } from "@/lib/types";
import type { GaleraInput } from "@/lib/ai/schemas";
import { textoSeguro } from "@/lib/ai/guardrails";
import { ROTULO_EIXO, ROTULO_NIVEL } from "./system";

const forca = (v: number) => (v >= 65 ? "forte" : v >= 35 ? "médio" : "leve");

export function buildGaleraPrompt(i: GaleraInput, careers: (Career | undefined)[]): string {
  const perfil = (Object.keys(ROTULO_EIXO) as AffinityAxis[])
    .map((e) => `- ${ROTULO_EIXO[e]}: ${Math.round(i.perfil[e])} (${forca(i.perfil[e])})`)
    .join("\n");
  const top4 = i.top4
    .map((t, n) => {
      const raio = careers[n]?.raioX.map((r) => `${r.t} ${r.what}`).join("; ");
      return `- id: ${t.id} | ${careers[n]?.nome ?? textoSeguro(t.nome, 120)}${raio ? ` | raio-x: ${raio}` : ""}`;
    })
    .join("\n");
  return `Perfil de afinidades (0–100):
${perfil}
Caminhos escolhidos pelo algoritmo (não mude):
${top4}
Habilidade a destravar: ${i.destravar.code} — ${textoSeguro(i.destravar.descricaoJovem, 200)} — situação: ${ROTULO_NIVEL[i.destravar.status]}
Gere JSON:
- porQueCombina: para cada id acima, { id, frase } com 1 frase (≤ 120 caracteres) ligando o caminho às afinidades.
- destravarTexto: 1 frase (≤ 140 caracteres) no formato "Pra chegar lá, destrava <termo>: <como aparece na profissão>."`;
}
