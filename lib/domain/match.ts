// docs/07 §6 — Match Day. Score determinístico; o Gemini só redige o porquê.
import type { MatchFactors, Mentor, PointEvent, Student, StudentSnapshot } from "../types";
import { LIMIARES, PESOS_MATCH, SEMESTRE } from "../config";
import { registrar } from "./pontos";
import { cosseno } from "./util";

export interface Elegibilidade { eligible: boolean; faltaPara: string[]; checklist: { item: string; ok: boolean }[] }

export function elegivel(s: StudentSnapshot, opts: { cenariosFaltando?: number } = {}): Elegibilidade {
  const falta = opts.cenariosFaltando ?? 0;
  const checklist = [
    { item: "Terminar o Da Galera", ok: s.galeraConcluido },
    { item: "Fazer pelo menos 1 missão BNCC", ok: s.missoes >= 1 },
    { item: "Frequência acima de 60%", ok: s.frequenciaMedia >= LIMIARES.elegibilidadeFrequencia },
  ];
  const faltaPara: string[] = [];
  if (!checklist[0].ok)
    faltaPara.push(falta > 0 ? `Termina o Da Galera — faltam ${falta} cenários` : "Termina o Da Galera");
  if (!checklist[1].ok) faltaPara.push("Faz uma missão BNCC — leva uns 8 minutos");
  if (!checklist[2].ok)
    faltaPara.push(`Bora manter a frequência acima de 60% — agora está em ${Math.round(s.frequenciaMedia)}%`);
  return { eligible: faltaPara.length === 0, faltaPara, checklist };
}

export const candidatos = (s: StudentSnapshot, mentors: Mentor[]) =>
  mentors.filter((m) => m.nivelMinimo <= s.nivel && m.vagasSemestre > 0);

export function fatorCarreira(s: StudentSnapshot, m: Mentor): number {
  return Math.max(
    0,
    ...m.careerIds.map((c) =>
      s.queroConhecer.includes(c) ? 1 : s.salvas.includes(c) ? 0.8 : s.top4.includes(c) ? 0.6 : 0,
    ),
  );
}

export function scoreMentor(s: StudentSnapshot, m: Mentor): { score: number; fatores: MatchFactors } {
  const fatores: MatchFactors = {
    afinidade: PESOS_MATCH.afinidade * cosseno(s.perfil, m.affinity),
    carreira: PESOS_MATCH.carreira * fatorCarreira(s, m),
    preferencia: PESOS_MATCH.preferencia * (s.preferenciasMentor.includes(m.id) ? 1 : 0),
    evolucao: PESOS_MATCH.evolucao * Math.min(1, s.evolucoes / 3),
    engajamento:
      PESOS_MATCH.engajamento * (0.5 * Math.min(1, s.missoes / 5) + 0.5 * Math.min(1, s.frequenciaMedia / 100)),
  };
  for (const k of Object.keys(fatores) as (keyof MatchFactors)[]) fatores[k] = Math.round(fatores[k] * 10) / 10;
  const score = Math.round(Object.values(fatores).reduce((a, b) => a + b, 0) * 10) / 10;
  return { score, fatores };
}

/** Maior score; empate → maior nivelMinimo → mais vagas → id alfabético. */
export function escolherMentor(
  s: StudentSnapshot,
  mentors: Mentor[],
): { mentor: Mentor; score: number; fatores: MatchFactors } | undefined {
  return candidatos(s, mentors)
    .map((mentor) => ({ mentor, ...scoreMentor(s, mentor) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.mentor.nivelMinimo - a.mentor.nivelMinimo ||
        b.mentor.vagasSemestre - a.mentor.vagasSemestre ||
        a.mentor.id.localeCompare(b.mentor.id),
    )[0];
}

/** Resultado do match sem os textos de IA (explicação e perguntas vêm do /api/match). */
export function calcularMatch(s: StudentSnapshot, mentors: Mentor[], opts: { cenariosFaltando?: number } = {}) {
  const el = elegivel(s, opts);
  if (!el.eligible) return { eligible: false as const, faltaPara: el.faltaPara };
  const best = escolherMentor(s, mentors);
  if (!best) return { eligible: false as const, faltaPara: ["Ainda não tem mentor com vaga — volta daqui a pouco"] };
  return { eligible: true as const, mentorId: best.mentor.id, score: best.score, fatores: best.fatores };
}

/** "Simular fim do semestre": +15 por semana restante (9–16) com frequência projetada ≥ 75%. */
export function simularSemestre(student: Student, eventos: PointEvent[], at: string): PointEvent[] {
  const novos: PointEvent[] = [];
  student.frequenciaProjetada.forEach((f, i) => {
    if (f < LIMIARES.presenca) return;
    const semana = SEMESTRE.semanasOcorridas + 1 + i;
    const e = registrar({ type: "presenca_semana", at, ref: `semana-${semana}` }, [...eventos, ...novos]);
    if (e) novos.push(e);
  });
  return novos;
}

/** Frequência média do semestre (inclui as semanas projetadas depois de simular). */
export function frequenciaMedia(student: Student, semestreSimulado: boolean): number {
  const xs = semestreSimulado ? [...student.frequencia, ...student.frequenciaProjetada] : student.frequencia;
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

/** 3 horários fictícios a partir da disponibilidade do mentor. */
export const horarios = (m: Mentor): string[] => m.disponibilidade.slice(0, 3);
