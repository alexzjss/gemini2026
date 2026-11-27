// Selectors (dono: Agente 2). Compõem seed + LocalState + lib/domain. Funções puras, sem React:
// o AppStore (Agente 1) expõe os hooks como
//   useStudentView(id) = useMemo(() => buildStudentView(seed, state, id, agora), [state, id])
//   useClassView(classId) = useMemo(() => buildClassView(seed, state, classId, agora), [state, classId])
import type {
  AffinityProfile, Career, ClassGroup, LocalState, Mentor, MissionDef, ReportCard, Scenario, School, Skill,
  SkillStatus, Student, StudentLocal, StudentSnapshot, Teacher,
} from "../types";
import { perfil as calcPerfil, perfilParcial, fraseTitulo, respondidos, top, type Frase } from "../domain/afinidades";
import { caminhos, combina, filaSwipe, ondeAEscolaAparece } from "../domain/carreiras";
import { rotuloProgresso, skillStatuses } from "../domain/diagnostico";
import { sinais as calcSinais, status as calcStatus, type AlertaRegistro, type Sinal, type StatusAtencao } from "../domain/evasao";
import { elegivel, frequenciaMedia } from "../domain/match";
import { carreiraNumero1, missaoDoDia, sugestoes } from "../domain/missoes";
import { faltam, infoNivel, nivelPorPontos, progressoNivel, textoFaltam } from "../domain/niveis";
import { totalPontos } from "../domain/pontos";
import { defasagemPorSkill, heatmap, matches, resumo, topInteresses, type AlunoTurma } from "../domain/turma";
import { dia, perfilVazio } from "../domain/util";

export interface SeedData {
  school: School;
  classes: ClassGroup[];
  teacher: Teacher;
  skills: Skill[];
  scenarios: Scenario[];
  frases: Frase[];
  careers: Career[];
  mentors: Mentor[];
  missoes: MissionDef[];
  students: Student[];
  reportCards: ReportCard[];
}

export function studentLocalVazio(): StudentLocal {
  return {
    galera: { respostas: {} },
    semana: { respostas: {} },
    swipe: { salvas: [], queroConhecer: [], passadas: [] },
    preferenciasMentor: [],
    eventos: [],
    skillOverrides: {},
    missoes: [],
    chats: {},
    iaCache: {},
  };
}

export function localState(): LocalState {
  return { version: 1, porAluno: {}, planos: [], alertas: {}, semestreSimulado: false };
}

const uniq = <T,>(xs: T[]) => [...new Set(xs)];

export function buildStudentView(seed: SeedData, state: LocalState, studentId: string, agoraIso: string) {
  const student = seed.students.find((s) => s.id === studentId);
  if (!student) throw new Error(`Aluno ${studentId} não existe no seed`);
  const local = state.porAluno[studentId] ?? studentLocalVazio();
  const reportCard = seed.reportCards.find((r) => r.studentId === studentId);

  // Ficha BNCC
  const skills = skillStatuses(reportCard, local.skillOverrides);
  const skillInfo = (code: string) => seed.skills.find((s) => s.code === code);

  // Da Galera
  const galeraCenarios = seed.scenarios.filter((c) => c.grupo === "galera");
  const semanaCenarios = seed.scenarios.filter((c) => c.grupo === "semana");
  const respostasGalera = { ...(student.galeraParcialSeed ?? {}), ...local.galera.respostas };
  const galeraRespondidos = student.galeraSeed ? galeraCenarios.length : respondidos(respostasGalera, galeraCenarios);
  const galeraConcluido = Boolean(student.galeraSeed || local.galera.concluidoEm);
  const todasRespostas = { ...respostasGalera, ...local.semana.respostas };
  const perfil: AffinityProfile | null = student.galeraSeed
    ? student.galeraSeed.perfil
    : galeraConcluido
      ? calcPerfil(todasRespostas, seed.scenarios)
      : null;
  const parcial = galeraConcluido ? null : perfilParcial(respostasGalera, galeraCenarios);
  const perfilUsado = perfil ?? parcial;

  // Carreiras
  const swipe: StudentLocal["swipe"] = {
    salvas: uniq([...(student.galeraSeed?.salvas ?? []), ...local.swipe.salvas]),
    queroConhecer: uniq([...(student.galeraSeed?.queroConhecer ?? []), ...local.swipe.queroConhecer]),
    passadas: local.swipe.passadas,
  };
  const top4 = perfilUsado ? caminhos(perfilUsado, seed.careers).map((c) => c.id) : [];
  const fila = filaSwipe(perfilUsado ?? perfilVazio(), seed.careers, swipe).map((career) => ({
    career,
    combina: perfilUsado ? combina(perfilUsado, career) : [],
    ondeAEscola: ondeAEscolaAparece(career, skills),
  }));

  // Pontos e nível
  const pontos = totalPontos(student.pontosSeed, local.eventos);
  const nivel = nivelPorPontos(pontos);

  // Missões
  const hoje = dia(agoraIso);
  const feitasHoje = local.missoes.filter((m) => dia(m.at) === hoje).map((m) => m.skillCode);
  const mv = { skills, careers: seed.careers, queroConhecer: swipe.queroConhecer, salvas: swipe.salvas, top4, feitasHoje };
  const missaoDef = (code?: string) => {
    if (!code) return undefined;
    const def = seed.missoes.find((m) => m.skillCode === code);
    return { code, titulo: def?.titulo ?? skillInfo(code)?.descricaoJovem ?? code, minutos: def?.minutos ?? 8, feitaHoje: feitasHoje.includes(code), status: skills.find((s) => s.code === code) };
  };
  const c1 = carreiraNumero1(mv);
  const missoesConcluidas = student.missoesSeed + local.missoes.length;
  const evolucoes = student.evolucoesSeed + local.eventos.filter((e) => e.type === "habilidade_subiu").length;

  // Mentores: nunca somem; bloqueados mostram "abre no nível N"
  const mentores = seed.mentors.map((mentor) => ({
    mentor,
    aberto: mentor.nivelMinimo <= nivel,
    preferido: local.preferenciasMentor.includes(mentor.id),
  }));

  const freq = frequenciaMedia(student, state.semestreSimulado);
  const snapshot: StudentSnapshot = {
    studentId,
    serie: student.serie,
    nivel,
    perfil: perfil ?? perfilVazio(),
    top4,
    salvas: swipe.salvas,
    queroConhecer: swipe.queroConhecer,
    preferenciasMentor: local.preferenciasMentor,
    skills,
    evolucoes,
    missoes: missoesConcluidas,
    frequenciaMedia: freq,
    galeraConcluido,
  };
  const elegibilidade = elegivel(snapshot, { cenariosFaltando: galeraCenarios.length - galeraRespondidos });

  return {
    student,
    local,
    skills: skills.map((s) => ({ ...s, skill: skillInfo(s.code), rotulo: rotuloProgresso(s, agoraIso) })),
    galera: {
      respostas: respostasGalera,
      respondidos: galeraRespondidos,
      total: galeraCenarios.length,
      faltam: galeraCenarios.length - galeraRespondidos,
      concluido: galeraConcluido,
      proximo: galeraCenarios.find((c) => !respostasGalera[c.id]),
      parcialTop3: parcial ? top(parcial, 3) : [],
    },
    semana: { cenarios: semanaCenarios, respostas: local.semana.respostas, concluido: Boolean(local.semana.concluidoEm) },
    perfil,
    resultado: perfil
      ? {
          frase: fraseTitulo(perfil, seed.frases),
          top4Eixos: top(perfil, 4),
          caminhos: top4.map((id) => seed.careers.find((c) => c.id === id)!),
          destravar: top4[0] ? ondeAEscolaAparece(seed.careers.find((c) => c.id === top4[0])!, skills) : undefined,
        }
      : undefined,
    swipe,
    top4,
    fila,
    pontos,
    nivel,
    nivelInfo: infoNivel(nivel),
    faltam: faltam(pontos),
    progressoNivel: progressoNivel(pontos),
    textoFaltam: textoFaltam(pontos),
    carreiraNumero1: c1,
    interesseQuiz: c1?.interesseQuiz,
    missaoDoDia: missaoDef(missaoDoDia(mv)),
    sugestoes: sugestoes(mv).map((c) => missaoDef(c)!),
    missoesConcluidas,
    evolucoes,
    mentores,
    snapshot,
    elegivel: elegibilidade,
    match: local.match,
  };
}

export type StudentView = ReturnType<typeof buildStudentView>;

export interface AtencaoItem { student: Student; sinais: Sinal[]; status: StatusAtencao; alerta?: AlertaRegistro }

export function buildClassView(seed: SeedData, state: LocalState, classId: ClassGroup["id"], agoraIso: string) {
  const turma = seed.classes.find((c) => c.id === classId);
  const alunosSeed = seed.students.filter((s) => s.classId === classId);
  const views = alunosSeed.map((s) => buildStudentView(seed, state, s.id, agoraIso));

  const atencao: AtencaoItem[] = views.map((v) => {
    const sinais = calcSinais(v.student, v.snapshot.skills, v.local, agoraIso);
    const alerta = state.alertas[v.student.id] as AlertaRegistro | undefined;
    return { student: v.student, sinais, status: calcStatus(sinais, alerta), alerta };
  });

  const alunos: AlunoTurma[] = views.map((v, i) => {
    const mentor = v.match?.mentorId ? seed.mentors.find((m) => m.id === v.match!.mentorId) : undefined;
    return {
      student: v.student,
      skills: v.snapshot.skills as SkillStatus[],
      queroConhecer: v.swipe.queroConhecer,
      salvas: v.swipe.salvas,
      top4: v.galera.concluido ? v.top4 : [],
      galeraConcluido: v.galera.concluido,
      status: atencao[i].status,
      ...(mentor ? { match: { mentorId: mentor.id, area: `${mentor.cargo} (${mentor.organizacao.toLowerCase()})` } } : {}),
    };
  });

  return {
    turma,
    alunos,
    heatmap: heatmap(alunos),
    defasagem: defasagemPorSkill(alunos),
    topInteresses: topInteresses(alunos, seed.careers),
    atencao: atencao.filter((a) => a.status !== "ok"),
    resumo: resumo(alunos, seed.careers),
    matches: matches(alunos),
  };
}

export type ClassView = ReturnType<typeof buildClassView>;
