"use client";
/**
 * ADAPTADOR DE DADOS DA UI DO PROFESSOR — único ponto de integração.
 *
 * Integrado ao AppStore (Agente 1) e aos selectors/domínio (Agente 2): o professor lê o mesmo
 * `localStorage` do aluno, então a missão do Kauã muda o heatmap ao vivo (D56). As telas só
 * conhecem os tipos de `../tipos.ts`; nada aqui decide regra: níveis, sinais e agregados vêm de `lib/domain`.
 */
import { useCallback, useMemo } from "react";
import type { ClassGroup, LessonPlan, SkillLevel } from "@/lib/types";
import type { AlunoTurma, AtencaoAluno, FichaAlunoView, LinhaHeatmap, TurmaView } from "../tipos";
import { useAppStore } from "@/lib/store/AppStore";
import { useClassView } from "@/lib/store/hooks";
import { studentView } from "@/lib/store/hooks";
import { classes, getClass, getMentor, getStudent, skills as SKILLS, teacher } from "@/lib/store/seed";
import { careers } from "@/lib/store/seed";
import { nivelPorPontos } from "@/lib/domain/niveis";
import { totalPontos } from "@/lib/domain/pontos";
import { frequenciaMedia } from "@/lib/domain/match";
import { sinais as calcSinais, status as calcStatus, type AlertaRegistro } from "@/lib/domain/evasao";

const TURMAS: ClassGroup[] = classes.filter((c) => teacher.classIds.includes(c.id));
const agora = () => new Date().toISOString();

/* ======================= montagem dos modelos de tela ======================= */

function atencaoDe(studentId: string, state: ReturnType<typeof useAppStore>["state"]): AtencaoAluno {
  const v = studentView(state, studentId);
  if (!v) return { status: "ok", motivos: [] };
  const sinais = calcSinais(v.student, v.snapshot.skills, v.local, agora());
  const alerta = state.alertas[studentId] as AlertaRegistro | undefined;
  return {
    status: calcStatus(sinais, alerta),
    motivos: sinais.map((s) => s.texto),
    conversa: alerta ? { conversouEm: alerta.conversouEm, nota: alerta.nota } : undefined,
  };
}

function alunoTurma(studentId: string, state: ReturnType<typeof useAppStore>["state"]): AlunoTurma | null {
  const v = studentView(state, studentId);
  if (!v) return null;
  const skills: Record<string, SkillLevel | undefined> = {};
  for (const s of v.snapshot.skills) skills[s.code] = s.level;
  const pontos = totalPontos(v.student.pontosSeed, v.local.eventos);
  return {
    id: v.student.id,
    nome: v.student.nome,
    inicial: v.student.inicial,
    nivel: nivelPorPontos(pontos),
    pontos,
    skills,
    atencao: atencaoDe(studentId, state),
    galeraConcluido: v.galera.concluido,
  };
}

function linhasHeatmap(alunos: AlunoTurma[]): LinhaHeatmap[] {
  return SKILLS.map((skill) => {
    const dist = { defasagem: 0, em_desenvolvimento: 0, dominada: 0 };
    for (const a of alunos) {
      const lv = a.skills[skill.code];
      if (lv) dist[lv]++;
    }
    const nComDado = dist.defasagem + dist.em_desenvolvimento + dist.dominada;
    return { skill, nComDado, distribuicao: dist, pctDefasagem: nComDado ? Math.round((dist.defasagem / nComDado) * 100) : 0 };
  }).sort((x, y) => y.pctDefasagem - x.pctDefasagem || y.nComDado - x.nComDado);
}

/* ======================= hooks públicos ======================= */

/** false até o localStorage carregar: as telas mostram skeleton. */
export function useHidratado() {
  return useAppStore().ui.hydrated;
}

/** Guarda do shell do professor. */
export function useSessaoProfessor() {
  const { state, ui } = useAppStore();
  return { ok: state.sessao?.role === "professor", hidratado: ui.hydrated, professor: teacher };
}

export function useTurmas() {
  return TURMAS;
}

export function useTurmaView(classId: string): TurmaView | null {
  const { state } = useAppStore();
  const valido = TURMAS.some((t) => t.id === classId);
  const cv = useClassView((valido ? classId : TURMAS[0].id) as ClassGroup["id"]);
  return useMemo(() => {
    const turma = getClass(classId);
    if (!valido || !turma) return null;
    const alunos = cv.alunos
      .map((a) => alunoTurma(a.student.id, state))
      .filter((a): a is AlunoTurma => Boolean(a))
      .sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR"));
    const linhas = linhasHeatmap(alunos);
    return {
      turma,
      turmas: TURMAS,
      professor: teacher,
      alunos,
      linhas,
      topInteresses: cv.topInteresses,
      resumo: {
        maiorDefasagem: linhas[0]?.nComDado ? linhas[0] : undefined,
        nAtencao: alunos.filter((a) => a.atencao.status === "atencao").length,
        pctGalera: cv.resumo.pctGalera,
      },
      matches: cv.matches.map((m) => ({ studentId: m.studentId, nome: m.nome, area: m.area })),
    };
  }, [classId, valido, cv, state]);
}

export function useFichaAluno(studentId: string): FichaAlunoView | null {
  const { state } = useAppStore();
  return useMemo(() => {
    const v = studentView(state, studentId);
    const aluno = alunoTurma(studentId, state);
    const turma = v && getClass(v.student.classId);
    if (!v || !aluno || !turma) return null;
    const mentor = v.match?.mentorId ? getMentor(v.match.mentorId) : undefined;
    const nomeCarreira = (id: string) => careers.find((c) => c.id === id)?.nome ?? id;
    return {
      aluno,
      turma,
      serie: v.student.serie,
      frequenciaMedia: Math.round(frequenciaMedia(v.student, state.semestreSimulado)),
      skills: v.skills.filter((s) => s.skill).map((s) => ({ ...s, skill: s.skill! })),
      perfil: v.perfil ?? undefined,
      carreiras: [
        ...v.swipe.queroConhecer.map((id) => ({ nome: nomeCarreira(id), tipo: "quero_conhecer" as const })),
        ...v.swipe.salvas.filter((id) => !v.swipe.queroConhecer.includes(id)).map((id) => ({ nome: nomeCarreira(id), tipo: "salva" as const })),
      ],
      match: mentor ? { mentor: `${mentor.cargo} · ${mentor.organizacao}`, area: mentor.cargo, agendadoPara: v.match?.agendadoPara } : undefined,
      missoes: [...v.local.missoes].sort((x, y) => y.at.localeCompare(x.at)),
    };
  }, [studentId, state]);
}

export function usePlanos(): LessonPlan[] {
  const { state } = useAppStore();
  return useMemo(() => [...state.planos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)), [state.planos]);
}

export function usePlano(planId: string): LessonPlan | undefined {
  return useAppStore().state.planos.find((p) => p.id === planId);
}

export function useAcoesProfessor() {
  const { state, dispatch } = useAppStore();

  const salvarPlano = useCallback((plano: LessonPlan) => dispatch({ type: "savePlan", plan: plano }), [dispatch]);
  const aprovarPlano = useCallback((planId: string) => dispatch({ type: "approvePlan", planId, at: agora() }), [dispatch]);
  const reabrirPlano = useCallback((planId: string) => dispatch({ type: "reopenPlan", planId }), [dispatch]);
  const registrarConversa = useCallback(
    (studentId: string, nota: string) => {
      const v = studentView(state, studentId);
      const student = getStudent(studentId);
      // Guarda os sinais vistos agora: um sinal novo depois disso reabre o alerta (docs/07 §7).
      const tipos = v && student ? calcSinais(student, v.snapshot.skills, v.local, agora()).map((s) => s.tipo) : [];
      dispatch({ type: "markConversation", studentId, nota, at: agora(), tipos });
    },
    [state, dispatch],
  );

  return { salvarPlano, aprovarPlano, reabrirPlano, registrarConversa };
}
