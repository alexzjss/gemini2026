import { describe, expect, it } from "vitest";
import { nivelPorMedia, progresso, rotuloProgresso, skillStatuses, tendencia } from "../diagnostico";
import type { ReportCard } from "../../types";

const rc = (notas: [number, number][], code = "EM13MAT316"): ReportCard => ({
  studentId: "x",
  avaliacoes: notas.flatMap(([a, b], i) => [
    { id: `${i}a`, componente: "Mat", titulo: "P1", bimestre: 1 as const, nota: a, skillCodes: [code] },
    { id: `${i}b`, componente: "Mat", titulo: "P2", bimestre: 2 as const, nota: b, skillCodes: [code] },
  ]),
});

describe("diagnóstico", () => {
  it("limites de nível: 4,9 / 5,0 / 7,0", () => {
    expect(nivelPorMedia(4.9)).toBe("defasagem");
    expect(nivelPorMedia(5.0)).toBe("em_desenvolvimento");
    expect(nivelPorMedia(6.9)).toBe("em_desenvolvimento");
    expect(nivelPorMedia(7.0)).toBe("dominada");
  });

  it("tendência usa ±0,5 entre bimestres", () => {
    expect(tendencia([5.2], [6.4])).toBe("subindo");
    expect(tendencia([6], [6.5])).toBe("estavel");
    expect(tendencia([7], [6.4])).toBe("caindo");
    expect(tendencia([], [6])).toBe("estavel");
  });

  it("override de missão prevalece sobre a média", () => {
    const [s] = skillStatuses(rc([[4, 4]]), { EM13MAT316: { level: "dominada", at: "2026-11-27T10:00:00Z" } });
    expect(s.level).toBe("dominada");
    expect(s.media).toBe(4);
    expect(s.subiuEm).toBeDefined();
  });

  it("progresso por nível", () => {
    expect(progresso("defasagem", 4.6)).toBe(45);
    expect(progresso("defasagem", 2)).toBe(20);
    expect(progresso("em_desenvolvimento", 5.8)).toBe(60);
    expect(progresso("dominada", 9)).toBe(100);
    expect(progresso("em_desenvolvimento", 6.9, 5)).toBe(95);
  });

  it("média e status do boletim", () => {
    const [s] = skillStatuses(rc([[5.2, 6.4]]));
    expect(s).toMatchObject({ level: "em_desenvolvimento", media: 5.8, tendencia: "subindo" });
  });

  it("rótulo da barra", () => {
    const agora = "2026-11-27T10:00:00Z";
    expect(rotuloProgresso({ code: "x", level: "defasagem", media: 2, tendencia: "estavel", progresso: 20 }, agora)).toBe("começando");
    expect(rotuloProgresso({ code: "x", level: "em_desenvolvimento", media: 6, tendencia: "estavel", progresso: 62 }, agora)).toBe("em desenvolvimento");
    expect(rotuloProgresso({ code: "x", level: "dominada", media: 6, tendencia: "estavel", progresso: 100, subiuEm: "2026-11-25T10:00:00Z" }, agora)).toBe("subiu esta semana");
  });
});
