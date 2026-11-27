import { describe, expect, it } from "vitest";
import diagnostico from "@/data/fallbacks/diagnostico.json";
import galera from "@/data/fallbacks/galera.json";
import match from "@/data/fallbacks/match.json";
import mentor from "@/data/fallbacks/mentor.json";
import missao from "@/data/fallbacks/missao.json";
import plano from "@/data/fallbacks/plano.json";
import { preencher, getFallback } from "@/lib/fallbacks";
import { embaralhar } from "../quiz";
import { quizOutput } from "../schemas";

const q = { enunciado: "x", alternativas: ["a", "b", "c", "d"], correta: 2, respostaCorreta: "c", explicacao: "e" };

describe("embaralhar", () => {
  it("mantém a alternativa correta e é determinístico", () => {
    const r1 = embaralhar(q, "EM13MAT316:futebol:0");
    expect(r1.alternativas[r1.correta]).toBe("c");
    expect(embaralhar(q, "EM13MAT316:futebol:0")).toEqual(r1);
    expect([...r1.alternativas].sort()).toEqual(["a", "b", "c", "d"]);
  });
  it("espalha a posição da correta", () => {
    const pos = new Set(Array.from({ length: 40 }, (_, n) => embaralhar(q, `s${n}`).correta));
    expect(pos.size).toBe(4);
  });
});

describe("quizOutput (gabarito)", () => {
  const base = { titulo: "t", questoes: [q, q, q, q] };
  it("aceita gabarito consistente", () => expect(quizOutput.safeParse(base).success).toBe(true));
  it("recusa índice que não bate com respostaCorreta", () => {
    const ruim = { ...base, questoes: [{ ...q, correta: 0 }, q, q, q] };
    expect(quizOutput.safeParse(ruim).success).toBe(false);
  });
  it("recusa alternativas repetidas", () => {
    const ruim = { ...base, questoes: [{ ...q, alternativas: ["a", "a", "c", "d"] }, q, q, q] };
    expect(quizOutput.safeParse(ruim).success).toBe(false);
  });
});

describe("fallbacks (doc 06)", () => {
  const chaves: [Record<string, unknown>, string[]][] = [
    [diagnostico, ["s001", "s002", "s003", "default"]],
    [galera, ["s001", "s002", "s003", "default"]],
    [missao, ["EM13MAT316:futebol", "EM13MAT316:games", "EM13MAT310:futebol", "EM13CNT301:futebol", "EM13MAT316", "default"]],
    [mentor, ["analista-dados-esportivos:1", "analista-dados-esportivos:2", "analista-dados-esportivos:3", "analista-dados-esportivos:pista", "default:1", "default:2", "default:3", "default:pista", "default"]],
    [match, ["s001", "s002", "s003", "default"]],
    [plano, ["2A:EM13MAT316:futebol", "2A:EM13MAT316:games", "default"]],
  ];
  it.each(chaves.map(([arq, ks], n) => [n, arq, ks] as const))("arquivo %i tem as chaves obrigatórias", (_n, arq, ks) => {
    for (const k of ks) expect(arq).toHaveProperty([k]);
  });

  it("todo quiz offline tem 4 questões, 4 alternativas distintas e gabarito 0–3", () => {
    for (const [, quiz] of Object.entries(missao)) {
      expect(quiz.questoes).toHaveLength(4);
      for (const x of quiz.questoes) {
        expect(new Set(x.alternativas).size).toBe(4);
        expect(x.correta).toBeGreaterThanOrEqual(0);
        expect(x.correta).toBeLessThanOrEqual(3);
      }
    }
  });

  it("planos offline somam 50 min e citam só [1]–[6]", () => {
    for (const [, p] of Object.entries(plano)) {
      expect(p.etapas.reduce((s, e) => s + e.minutos, 0)).toBe(50);
      expect(p.etapas.flatMap((e) => e.citacoes).every((n) => n >= 1 && n <= 6)).toBe(true);
    }
  });

  it("getFallback tenta as chaves em ordem e termina em default", () => {
    expect(getFallback("missao", ["nao-existe", "EM13MAT316"]).chave).toBe("EM13MAT316");
    expect(getFallback("missao", ["nao-existe"]).chave).toBe("default");
  });

  it("preencher não re-substitui valores vindos do usuário", () => {
    expect(preencher({ a: "oi {x}" }, { x: "{y}", y: "HACK" })).toEqual({ a: "oi {y}" });
  });
});
