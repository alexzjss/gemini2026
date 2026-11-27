import type { DiagnosticoInput } from "@/lib/ai/schemas";
import { textoSeguro } from "@/lib/ai/guardrails";
import { ROTULO_NIVEL } from "./system";

export function buildDiagnosticoPrompt(i: DiagnosticoInput): string {
  const lista = i.skills.map((s) => `- ${s.code} | ${ROTULO_NIVEL[s.level]} | ${textoSeguro(s.descricaoJovem, 200)}`).join("\n");
  return `Estudante do ${i.serie}º ano do EM. Habilidades (código, situação, descrição):
${lista}
Gere JSON:
- resumo: até 2 frases sobre o momento dele(a) na escola, começando pelo que ele(a) já domina.
- destaques: 2 frases curtas sobre habilidades dominadas.
- proximosPassos: 2 frases curtas, cada uma sobre uma habilidade a destravar, com um motivo prático.`;
}
