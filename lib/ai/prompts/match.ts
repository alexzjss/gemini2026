import type { MatchFactors, Mentor } from "@/lib/types";

export function buildMatchPrompt(o: {
  mentor: Mentor;
  fatores: MatchFactors;
  queroConhecer: string[];
  evoluiram: string[];
}): string {
  const f = o.fatores;
  const r = (n: number) => Math.round(n);
  return `O algoritmo já escolheu o mentor (NÃO altere): ${o.mentor.cargo} · ${o.mentor.organizacao} — ${o.mentor.bio}
Fatores do score (pontos de 100): afinidade ${r(f.afinidade)}/40, carreira que curtiu ${r(f.carreira)}/25,
pedido do estudante ${r(f.preferencia)}/10, evolução no semestre ${r(f.evolucao)}/15, engajamento ${r(f.engajamento)}/10.
Carreiras que o estudante quis conhecer: ${o.queroConhecer.join(", ") || "nenhuma ainda"}. Habilidades que evoluíram: ${o.evoluiram.join(", ") || "nenhuma registrada"}.
Gere JSON:
- explicacao: 3 frases sobre por que o match faz sentido, valorizando ESFORÇO e EVOLUÇÃO
  (nunca notas).
- perguntasSugeridas: 3 perguntas que o estudante pode fazer ao mentor, ligando o que estudou
  (cite pelo nome as habilidades que evoluíram) à rotina da profissão.`;
}
