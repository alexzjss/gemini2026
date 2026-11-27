// Roteiro da demo (docs/03) aplicado ao Kauã só com regras de lib/domain.
// Serve de teste de integração e de referência para o reducer do AppStore (Agente 1).
import type { LocalState, PointEvent, StudentLocal } from "../lib/types";
import { calcularMatch, simularSemestre } from "../lib/domain/match";
import { resultadoMissao } from "../lib/domain/missoes";
import { registrar } from "../lib/domain/pontos";
import { buildStudentView, localState, studentLocalVazio, type SeedData } from "../lib/store/selectors";

export const AGORA = "2026-11-27T13:00:00.000Z";
export const KAUA = "s001";
/** Respostas do passo 4 (os 4 cenários que faltam). */
export const RESPOSTAS_RESTANTES: Record<string, string> = { g07: "A", g08: "A", g09: "D", g10: "B" };

function comAluno(state: LocalState, id: string, fn: (l: StudentLocal) => StudentLocal): LocalState {
  return { ...state, porAluno: { ...state.porAluno, [id]: fn(state.porAluno[id] ?? studentLocalVazio()) } };
}

const addEventos = (l: StudentLocal, evs: (PointEvent | null)[]): StudentLocal => ({
  ...l,
  eventos: [...l.eventos, ...evs.filter((e): e is PointEvent => e !== null)],
});

export function roteiroKaua(seed: SeedData, at = AGORA) {
  const passos: { passo: string; pontos: number; nivel: number }[] = [];
  let state = localState();
  const view = () => buildStudentView(seed, state, KAUA, at);
  const marca = (passo: string) => passos.push({ passo, pontos: view().pontos, nivel: view().nivel });

  // 1–3 entra, consente, vê o Início
  state = { ...state, sessao: { role: "aluno", studentId: KAUA } };
  state = comAluno(state, KAUA, (l) => ({ ...l, consentAt: at, ultimoAcesso: at }));
  marca("inicio");
  const missaoInicial = view().missaoDoDia?.code;
  const sugestoesIniciais = view().sugestoes.map((s) => s.code);

  // 4 Da Galera: os 4 cenários restantes → +50
  state = comAluno(state, KAUA, (l) =>
    addEventos(
      { ...l, galera: { respostas: { ...l.galera.respostas, ...RESPOSTAS_RESTANTES }, concluidoEm: at } },
      [registrar({ type: "galera_concluido", at }, l.eventos)],
    ),
  );
  marca("galera");
  const resultado = view().resultado;

  // 6 Swipe: passa 1, "Quero conhecer" a analista → +10
  const passada = view().fila.find((f) => f.career.id !== "analista-dados-esportivos")!.career.id;
  state = comAluno(state, KAUA, (l) =>
    addEventos(
      { ...l, swipe: { ...l.swipe, passadas: [...l.swipe.passadas, passada], queroConhecer: [...l.swipe.queroConhecer, "analista-dados-esportivos"] } },
      [registrar({ type: "carreira_explorada", at, ref: "analista-dados-esportivos" }, l.eventos)],
    ),
  );
  marca("swipe");

  // 7 Detalhe: Big Tech bloqueado; "Quero no meu Match Day" na analista do clube
  const mentoresDetalhe = view().mentores.filter((m) => m.mentor.careerIds.includes("analista-dados-esportivos"));
  state = comAluno(state, KAUA, (l) => ({ ...l, preferenciasMentor: [...l.preferenciasMentor, "m01"] }));

  // 8 Mentor simulado: mini-desafio resolvido → +20
  state = comAluno(state, KAUA, (l) =>
    addEventos(l, [registrar({ type: "mini_desafio_mentor", at, ref: "analista-dados-esportivos:1" }, l.eventos, { nivel: view().nivel })]),
  );
  marca("mentor-simulado");

  // 9 Missão do dia EM13MAT316, 3/4 → +30 +40 +40, sobe de nível
  const skill = view().snapshot.skills.find((s) => s.code === "EM13MAT316")!;
  const r = resultadoMissao({ skill, acertos: 3, at, historico: view().local.eventos, nivel: view().nivel });
  state = comAluno(state, KAUA, (l) => ({
    ...addEventos(l, r.eventos),
    missoes: [...l.missoes, { skillCode: "EM13MAT316", acertos: 3, total: 4, at }],
    skillOverrides: r.override ? { ...l.skillOverrides, EM13MAT316: r.override } : l.skillOverrides,
  }));
  marca("missao");

  // 13 Match Day: simular fim do semestre → +90 → nível 4 → match
  const presenca = simularSemestre(view().student, view().local.eventos, at);
  state = { ...state, semestreSimulado: true };
  state = comAluno(state, KAUA, (l) => addEventos(l, presenca));
  marca("semestre");
  const match = calcularMatch(view().snapshot, seed.mentors);

  return { state, passos, missaoInicial, sugestoesIniciais, resultado, passada, mentoresDetalhe, missao: r, presenca, match, final: view() };
}
