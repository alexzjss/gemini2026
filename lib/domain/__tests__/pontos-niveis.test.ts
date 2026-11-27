import { describe, expect, it } from "vitest";
import { podeGanhar, pontuar, registrar, totalPontos } from "../pontos";
import { abreNoNivel, faltam, nivelPorPontos, progressoNivel, textoFaltam } from "../niveis";
import type { PointEvent } from "../../types";

const D1 = "2026-11-27T10:00:00Z";
const D2 = "2026-11-28T10:00:00Z";
const ev = (type: PointEvent["type"], at: string, ref?: string): PointEvent => ({ type, at, ref, pontos: pontuar(type) });

describe("pontos", () => {
  it("tabela de pontos", () => {
    expect(pontuar("galera_concluido")).toBe(50);
    expect(pontuar("missao_concluida")).toBe(30);
    expect(pontuar("missao_aprovada")).toBe(40);
    expect(pontuar("habilidade_subiu")).toBe(40);
    expect(pontuar("presenca_semana")).toBe(15);
    expect(pontuar("carreira_explorada")).toBe(10);
    expect(pontuar("mini_desafio_mentor")).toBe(20);
  });

  it("Da Galera só 1x", () => {
    expect(podeGanhar({ type: "galera_concluido", at: D1 }, [])).toBe(true);
    expect(podeGanhar({ type: "galera_concluido", at: D2 }, [ev("galera_concluido", D1)])).toBe(false);
  });

  it("missão: 1x por habilidade por dia", () => {
    const h = [ev("missao_concluida", D1, "EM13MAT316")];
    expect(podeGanhar({ type: "missao_concluida", at: D1, ref: "EM13MAT316" }, h)).toBe(false);
    expect(podeGanhar({ type: "missao_concluida", at: D1, ref: "EM13MAT310" }, h)).toBe(true);
    expect(podeGanhar({ type: "missao_concluida", at: D2, ref: "EM13MAT316" }, h)).toBe(true);
  });

  it("carreira explorada: 1x por carreira", () => {
    const h = [ev("carreira_explorada", D1, "a")];
    expect(podeGanhar({ type: "carreira_explorada", at: D2, ref: "a" }, h)).toBe(false);
    expect(podeGanhar({ type: "carreira_explorada", at: D2, ref: "b" }, h)).toBe(true);
  });

  it("desafio da semana: 1x por semana", () => {
    const h = [ev("desafio_semana", "2026-11-23T10:00:00Z")];
    expect(podeGanhar({ type: "desafio_semana", at: "2026-11-27T10:00:00Z" }, h)).toBe(false);
    expect(podeGanhar({ type: "desafio_semana", at: "2026-11-30T10:00:00Z" }, h)).toBe(true);
  });

  it("mini-desafio: 1/dia no nível 1–2, 3/dia a partir do nível 3, 1x por sessão", () => {
    const h = [ev("mini_desafio_mentor", D1, "s1")];
    expect(podeGanhar({ type: "mini_desafio_mentor", at: D1, ref: "s2" }, h, { nivel: 2 })).toBe(false);
    expect(podeGanhar({ type: "mini_desafio_mentor", at: D1, ref: "s2" }, h, { nivel: 3 })).toBe(true);
    expect(podeGanhar({ type: "mini_desafio_mentor", at: D1, ref: "s1" }, h, { nivel: 3 })).toBe(false);
  });

  it("nota alta não gera ponto: não existe evento de nota", () => {
    expect(totalPontos(100, [])).toBe(100);
    expect(registrar({ type: "galera_concluido", at: D1 }, [ev("galera_concluido", D1)])).toBeNull();
  });

  it("total = seed + eventos", () => {
    expect(totalPontos(1240, [ev("galera_concluido", D1), ev("carreira_explorada", D1, "a")])).toBe(1300);
  });
});

describe("níveis", () => {
  it("limites 299→1, 300→2, 700→3, 1.500→4, 2.500→5", () => {
    expect(nivelPorPontos(299)).toBe(1);
    expect(nivelPorPontos(300)).toBe(2);
    expect(nivelPorPontos(699)).toBe(2);
    expect(nivelPorPontos(700)).toBe(3);
    expect(nivelPorPontos(1499)).toBe(3);
    expect(nivelPorPontos(1500)).toBe(4);
    expect(nivelPorPontos(2500)).toBe(5);
  });

  it("1.240 → '1.240 / 1.500', faltam 260", () => {
    expect(faltam(1240)).toBe(260);
    const p = progressoNivel(1240);
    expect(p.rotulo).toBe("1.240 / 1.500");
    expect(p.fracao).toBeCloseTo((1240 - 700) / 800);
  });

  it("texto do Início e o que cada nível abre", () => {
    expect(textoFaltam(1240)).toBe("Faltam 260 pontos pro nível 4, que abre os mentores de alta demanda.");
    expect(abreNoNivel(2)).toContain("universitários");
    expect(faltam(3000)).toBe(0);
  });
});
