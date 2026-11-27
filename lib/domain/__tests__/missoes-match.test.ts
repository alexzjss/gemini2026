import { describe, expect, it } from "vitest";
import { missaoDoDia, resultadoMissao, sugestoes } from "../missoes";
import { candidatos, elegivel, escolherMentor, scoreMentor, simularSemestre } from "../match";
import { buildStudentView, localState } from "../../store/selectors";
import { seed, snapshot } from "./fixtures";
import type { Mentor, SkillStatus } from "../../types";

const AGORA = "2026-11-27T13:00:00Z";

describe("missões", () => {
  it("Kauã → EM13MAT316 + EM13MAT310 + EM13CNT301", () => {
    const v = buildStudentView(seed, localState(), "s001", AGORA);
    expect(v.missaoDoDia?.code).toBe("EM13MAT316");
    expect(v.missaoDoDia?.titulo).toMatch(/artilheiro/);
    expect(v.sugestoes.map((s) => s.code)).toEqual(["EM13MAT310", "EM13CNT301"]);
  });

  it("sem carreira, missão do dia é a 1ª defasagem", () => {
    const skills: SkillStatus[] = [
      { code: "A", level: "em_desenvolvimento", media: 6, tendencia: "estavel", progresso: 60 },
      { code: "B", level: "defasagem", media: 3, tendencia: "estavel", progresso: 30 },
    ];
    expect(missaoDoDia({ skills, careers: [], queroConhecer: [], salvas: [], top4: [] })).toBe("B");
  });

  it("sugestões excluem o que já foi feito hoje", () => {
    const v = buildStudentView(seed, localState(), "s001", AGORA);
    const mv = { skills: v.snapshot.skills, careers: seed.careers, queroConhecer: [], salvas: [], top4: v.top4, feitasHoje: ["EM13MAT310"] };
    expect(sugestoes(mv)).not.toContain("EM13MAT310");
  });

  it("missão com < 3 acertos dá só +30", () => {
    const skill: SkillStatus = { code: "EM13MAT310", level: "defasagem", media: 4.6, tendencia: "estavel", progresso: 45 };
    const r = resultadoMissao({ skill, acertos: 2, at: AGORA, historico: [] });
    expect(r.eventos.map((e) => e.pontos)).toEqual([30]);
    expect(r.override).toBeUndefined();
    expect(r.mensagem).toMatch(/Bora de novo amanhã/);
  });

  it("missão aprovada sobe 1 nível e soma 110; no mesmo dia não sobe de novo", () => {
    const skill: SkillStatus = { code: "EM13MAT310", level: "defasagem", media: 4.6, tendencia: "estavel", progresso: 45 };
    const r = resultadoMissao({ skill, acertos: 3, at: AGORA, historico: [] });
    expect(r.eventos.reduce((s, e) => s + e.pontos, 0)).toBe(110);
    expect(r.override?.level).toBe("em_desenvolvimento");
    const r2 = resultadoMissao({ skill: { ...skill, level: "em_desenvolvimento" }, acertos: 4, at: AGORA, historico: r.eventos });
    expect(r2.eventos).toHaveLength(0);
    expect(r2.override).toBeUndefined();
  });
});

const m = (over: Partial<Mentor>): Mentor => ({
  id: "mx", nome: "X", inicial: "X", cargo: "c", organizacao: "o", categoria: "regiao", nivelMinimo: 1,
  careerIds: [], affinity: { analisar: 50, tech: 50, criar: 50, cuidar: 50, negocios: 50, esportes: 50 },
  bio: "", disponibilidade: [], vagasSemestre: 1, ...over,
});

describe("match", () => {
  it("elegibilidade exige Da Galera, 1 missão e frequência ≥ 60%", () => {
    expect(elegivel(snapshot()).eligible).toBe(true);
    const e = elegivel(snapshot({ galeraConcluido: false, missoes: 0, frequenciaMedia: 50 }), { cenariosFaltando: 4 });
    expect(e.eligible).toBe(false);
    expect(e.faltaPara[0]).toBe("Termina o Da Galera — faltam 4 cenários");
    expect(e.faltaPara).toHaveLength(3);
  });

  it("candidatos respeitam nível e vagas", () => {
    const ids = candidatos(snapshot({ nivel: 3 }), seed.mentors).map((x) => x.id);
    expect(ids).not.toContain("m10");
    expect(seed.mentors.filter((x) => x.nivelMinimo === 4).every((x) => !ids.includes(x.id))).toBe(true);
    expect(candidatos(snapshot({ nivel: 4 }), [m({ vagasSemestre: 0 })])).toHaveLength(0);
  });

  it("fatores somam o score e medem esforço, não nota", () => {
    const s = snapshot({ queroConhecer: ["c1"], preferenciasMentor: ["mx"], evolucoes: 3, missoes: 5, frequenciaMedia: 100 });
    const { score, fatores } = scoreMentor(s, m({ careerIds: ["c1"] }));
    expect(fatores).toEqual({ afinidade: 40, carreira: 25, preferencia: 10, evolucao: 15, engajamento: 10 });
    expect(score).toBe(100);
  });

  it("empate → maior nivelMinimo → mais vagas → id", () => {
    const s = snapshot({ nivel: 4 });
    expect(escolherMentor(s, [m({ id: "a", nivelMinimo: 1 }), m({ id: "b", nivelMinimo: 2 })])?.mentor.id).toBe("b");
    expect(escolherMentor(s, [m({ id: "a", vagasSemestre: 1 }), m({ id: "b", vagasSemestre: 3 })])?.mentor.id).toBe("b");
    expect(escolherMentor(s, [m({ id: "b" }), m({ id: "a" })])?.mentor.id).toBe("a");
  });

  it("simular semestre do Kauã = 6 semanas = +90, sem duplicar", () => {
    const kaua = seed.students.find((s) => s.id === "s001")!;
    const evs = simularSemestre(kaua, [], AGORA);
    expect(evs).toHaveLength(6);
    expect(evs.reduce((s, e) => s + e.pontos, 0)).toBe(90);
    expect(simularSemestre(kaua, evs, AGORA)).toHaveLength(0);
  });
});
