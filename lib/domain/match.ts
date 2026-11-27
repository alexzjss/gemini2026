/* PROVISÓRIO (contrato 2 · dono: Agente 2). Regras de docs/07 §6. */
import { LIMIARES, PESOS_MATCH, SEMESTRE } from "@/lib/config";
import type { MatchFactors, Mentor, PointEvent, Student, StudentSnapshot } from "@/lib/types";
import { cosseno } from "./afinidades";
import { pontuar } from "./pontos";

export function elegivel(s: StudentSnapshot): { eligible: boolean; faltaPara: string[] } {
  const faltaPara: string[] = [];
  if (!s.galeraConcluido) faltaPara.push("Termina o Da Galera — é rapidinho e conta muito pro match.");
  if (s.missoes < LIMIARES.match.missoesMinimas) faltaPara.push("Faz pelo menos 1 missão BNCC neste semestre.");
  if (s.frequenciaMedia < LIMIARES.match.frequenciaMinima)
    faltaPara.push(`Segura a frequência: o Match Day pede ${LIMIARES.match.frequenciaMinima}% no semestre.`);
  return { eligible: faltaPara.length === 0, faltaPara };
}

export function scoreMentor(s: StudentSnapshot, m: Mentor): { score: number; fatores: MatchFactors } {
  const cv = PESOS_MATCH.carreiraValores;
  const carreira = Math.max(
    0,
    ...m.careerIds.map((id) =>
      s.queroConhecer.includes(id) ? cv.quero : s.salvas.includes(id) ? cv.salva : s.top4.includes(id) ? cv.top4 : 0,
    ),
  );
  const fatores: MatchFactors = {
    afinidade: PESOS_MATCH.afinidade * cosseno(s.perfil, m.affinity),
    carreira: PESOS_MATCH.carreira * carreira,
    preferencia: PESOS_MATCH.preferencia * (s.preferenciasMentor.includes(m.id) ? 1 : 0),
    evolucao: PESOS_MATCH.evolucao * Math.min(1, s.evolucoes / PESOS_MATCH.evolucoesParaMaximo),
    engajamento:
      PESOS_MATCH.engajamento *
      (0.5 * Math.min(1, s.missoes / PESOS_MATCH.missoesParaMaximo) + 0.5 * Math.min(1, s.frequenciaMedia / 100)),
  };
  const r = (x: number) => Math.round(x * 10) / 10;
  (Object.keys(fatores) as (keyof MatchFactors)[]).forEach((k) => (fatores[k] = r(fatores[k])));
  const score = r(Object.values(fatores).reduce((a, b) => a + b, 0));
  return { score, fatores };
}

export function candidatos(s: StudentSnapshot, mentors: Mentor[]): Mentor[] {
  return mentors.filter((m) => m.nivelMinimo <= s.nivel && m.vagasSemestre > 0);
}

export function escolherMentor(
  s: StudentSnapshot,
  mentors: Mentor[],
): { mentor: Mentor; score: number; fatores: MatchFactors } | null {
  const ranked = candidatos(s, mentors)
    .map((m) => ({ mentor: m, ...scoreMentor(s, m) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.mentor.nivelMinimo - a.mentor.nivelMinimo ||
        b.mentor.vagasSemestre - a.mentor.vagasSemestre ||
        a.mentor.id.localeCompare(b.mentor.id),
    );
  return ranked[0] ?? null;
}

/** Lança `presenca_semana` nas semanas 9–16 com frequência projetada ≥ 75%. */
export function simularSemestre(student: Student, eventos: PointEvent[], at: string): PointEvent[] {
  const primeira = SEMESTRE.semanasOcorridas + 1;
  return student.frequenciaProjetada
    .map((f, i) => ({ f, semana: primeira + i }))
    .filter(({ f, semana }) => f >= LIMIARES.match.presencaSemana && !eventos.some((e) => e.type === "presenca_semana" && e.ref === `semana-${semana}`))
    .map(({ semana }) => pontuar({ type: "presenca_semana", ref: `semana-${semana}`, at }));
}

export function horarios(m: Mentor): string[] {
  return m.disponibilidade.slice(0, 3);
}
