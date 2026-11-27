"use client";
/* PROVISÓRIO (dono: Agente 2). Só o mínimo que os shells e o Match Day (F7) usam.
 * O Agente 2 completa com fila, missaoDoDia, sugestoes etc. sem mudar estes campos. */
import { useMemo } from "react";
import type { AffinityProfile, LocalState, StudentSnapshot } from "@/lib/types";
import { careers, getReportCard, getStudent, mentors, scenariosGalera } from "./seed";
import { emptyStudentLocal } from "./local";
import { useAppStore } from "./AppStore";
import { totalPontos } from "@/lib/domain/pontos";
import { faltam, nivelDef, nivelPorPontos, progressoNivel, proximoNivel } from "@/lib/domain/niveis";
import { skillStatuses } from "@/lib/domain/diagnostico";
import { cosseno, perfil as calcPerfil, perfilVazio } from "@/lib/domain/afinidades";
import { elegivel } from "@/lib/domain/match";

export function buildStudentView(local: LocalState, studentId: string) {
  const student = getStudent(studentId);
  if (!student) return null;
  const a = local.porAluno[studentId] ?? emptyStudentLocal();

  const pontos = totalPontos(student.pontosSeed, a.eventos);
  const nivel = nivelPorPontos(pontos);
  const skills = skillStatuses(getReportCard(studentId), a.skillOverrides);

  const respostas = { ...(student.galeraParcialSeed ?? {}), ...a.galera.respostas };
  const totalGalera = Math.max(scenariosGalera().length, 10);
  const respondidos = Object.keys(respostas).length;
  const galeraConcluido = Boolean(a.galera.concluidoEm) || Boolean(student.galeraSeed);

  let perfil: AffinityProfile = student.galeraSeed?.perfil ?? perfilVazio();
  if (!student.galeraSeed && scenariosGalera().length) perfil = calcPerfil({ ...respostas, ...a.semana.respostas }, [...scenariosGalera()]);

  const top4 = [...careers]
    .map((c) => ({ id: c.id, sim: cosseno(perfil, c.affinity) }))
    .sort((x, y) => y.sim - x.sim)
    .slice(0, 4)
    .map((x) => x.id);

  const salvas = [...new Set([...(student.galeraSeed?.salvas ?? []), ...a.swipe.salvas])];
  const queroConhecer = [...new Set([...(student.galeraSeed?.queroConhecer ?? []), ...a.swipe.queroConhecer])];
  const freqs = local.semestreSimulado ? [...student.frequencia, ...student.frequenciaProjetada] : student.frequencia;
  const frequenciaMedia = Math.round(freqs.reduce((s, x) => s + x, 0) / freqs.length);
  const evolucoes = student.evolucoesSeed + a.eventos.filter((e) => e.type === "habilidade_subiu").length;
  const missoes = student.missoesSeed + a.missoes.length;

  const snapshot: StudentSnapshot = {
    studentId, serie: student.serie, nivel, perfil, top4, salvas, queroConhecer,
    preferenciasMentor: a.preferenciasMentor, skills, evolucoes, missoes, frequenciaMedia, galeraConcluido,
  };

  return {
    student,
    local: a,
    nome: student.nome,
    pontos,
    nivel,
    nivelDef: nivelDef(nivel),
    proximo: proximoNivel(pontos),
    faltam: faltam(pontos),
    progressoNivel: progressoNivel(pontos),
    skills,
    perfil,
    top4,
    galera: { respondidos: Math.min(respondidos, totalGalera), total: totalGalera, concluido: galeraConcluido },
    snapshot,
    elegibilidade: elegivel(snapshot),
    mentores: mentors,
    match: a.match,
  };
}

export type StudentView = NonNullable<ReturnType<typeof buildStudentView>>;

export function useStudentView(studentId: string | undefined): StudentView | null {
  const { state } = useAppStore();
  return useMemo(() => (studentId ? buildStudentView(state, studentId) : null), [state, studentId]);
}
