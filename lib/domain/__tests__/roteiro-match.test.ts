/* Aceite F7: Kauã 1.240 → 1.520, nível 3 → 4, match com a analista de desempenho do clube. */
import { describe, expect, it } from "vitest";
import { reducer, pontosDoAluno, type StoreState } from "@/lib/store/AppStore";
import { initialState } from "@/lib/store/local";
import { buildStudentView } from "@/lib/store/selectors";
import { escolherMentor, simularSemestre } from "@/lib/domain/match";
import { nivelPorPontos } from "@/lib/domain/niveis";
import { getStudent, mentors } from "@/lib/store/seed";

const at = "2026-11-27T13:00:00.000Z";
const start = (): StoreState => ({ local: initialState(), ui: { hydrated: true, aiOffline: false, toasts: [] } });

function roteiro() {
  let s = start();
  const run = (a: Parameters<typeof reducer>[1]) => (s = reducer(s, a));
  run({ type: "login", studentId: "s001", at });
  run({ type: "consent", studentId: "s001", at });
  run({ type: "finishGalera", studentId: "s001", at });                                       // +50
  run({ type: "swipe", studentId: "s001", careerId: "analista-dados-esportivos", kind: "want", at }); // +10
  run({ type: "preferMentor", studentId: "s001", mentorId: "m01-renata" });
  run({ type: "awardMiniChallenge", studentId: "s001", sessionId: "sessao-1", at });            // +20
  run({ type: "finishMission", studentId: "s001", skillCode: "EM13MAT316", acertos: 3, at });   // +110
  return { s, run };
}

describe("roteiro do Kauã até o Match Day", () => {
  it("começa com 1.240 pts no nível 3", () => {
    expect(pontosDoAluno(start().local, "s001")).toBe(1240);
    expect(nivelPorPontos(1240)).toBe(3);
  });

  it("chega a 1.430 antes de simular o semestre", () => {
    const { s } = roteiro();
    expect(pontosDoAluno(s.local, "s001")).toBe(1430);
    expect(s.local.porAluno.s001.skillOverrides.EM13MAT316?.level).toBe("dominada");
  });

  it("simular o semestre do Kauã dá +90 (6 semanas ≥ 75%)", () => {
    const eventos = simularSemestre(getStudent("s001")!, [], at);
    expect(eventos).toHaveLength(6);
    expect(eventos.reduce((t, e) => t + e.pontos, 0)).toBe(90);
  });

  it("termina em 1.520 pts, nível 4, match com a analista do clube", () => {
    const { s: s0, run } = roteiro();
    let s = s0;
    s = run({ type: "simulateSemester", studentId: "s001", at });
    expect(pontosDoAluno(s.local, "s001")).toBe(1520);
    const view = buildStudentView(s.local, "s001")!;
    expect(view.nivel).toBe(4);
    expect(view.elegibilidade.eligible).toBe(true);
    expect(escolherMentor(view.snapshot, mentors)?.mentor.id).toBe("m01-renata");
  });

  it("não deixa farmar: simular de novo, mini-desafio da mesma sessão e Quero conhecer repetido valem 0", () => {
    const { s: s0, run } = roteiro();
    let s = run({ type: "simulateSemester", studentId: "s001", at });
    s = run({ type: "simulateSemester", studentId: "s001", at });
    s = run({ type: "awardMiniChallenge", studentId: "s001", sessionId: "sessao-1", at });
    s = run({ type: "swipe", studentId: "s001", careerId: "analista-dados-esportivos", kind: "want", at });
    expect(s0).toBeDefined();
    expect(pontosDoAluno(s.local, "s001")).toBe(1520);
  });

  it("Big Tech fica fora dos candidatos no nível 3 (vitrine bloqueada)", () => {
    const { s } = roteiro();
    const view = buildStudentView(s.local, "s001")!;
    expect(view.nivel).toBe(3);
    expect(escolherMentor(view.snapshot, mentors)?.mentor.nivelMinimo).toBeLessThanOrEqual(3);
  });
});
