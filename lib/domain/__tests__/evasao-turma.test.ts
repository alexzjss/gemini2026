import { describe, expect, it } from "vitest";
import { sinais, status } from "../evasao";
import { buildClassView, localState } from "../../store/selectors";
import { seed } from "./fixtures";
import type { SkillStatus, Student } from "../../types";

const AGORA = "2026-11-27T13:00:00Z";
const aluno = (over: Partial<Student> = {}): Student => ({
  id: "x", matricula: "0", nome: "X", inicial: "X", classId: "2A", serie: 2,
  frequencia: [90, 90, 90, 90, 90, 90, 90, 90], frequenciaProjetada: [], ultimoAcessoDiasAtras: 1,
  pontosSeed: 0, missoesSeed: 0, evolucoesSeed: 0, ...over,
});
const caindo = (code: string): SkillStatus => ({ code, level: "em_desenvolvimento", media: 6, tendencia: "caindo", progresso: 60 });

describe("evasão (só professor)", () => {
  it("sem sinais → ok", () => {
    expect(sinais(aluno(), [])).toEqual([]);
    expect(status([])).toBe("ok");
  });

  it("frequência baixa nas últimas 4 semanas", () => {
    const s = sinais(aluno({ frequencia: [90, 90, 90, 90, 70, 70, 70, 70] }), []);
    expect(s.map((x) => x.tipo)).toContain("frequencia_baixa");
    expect(s.find((x) => x.tipo === "frequencia_baixa")?.texto).toBe("Frequência de 70% nas últimas 4 semanas");
  });

  it("queda de frequência ≥ 15 p.p.", () => {
    const s = sinais(aluno({ frequencia: [95, 95, 95, 95, 95, 95, 80, 80] }), []);
    expect(s.map((x) => x.tipo)).toEqual(["queda_frequencia"]);
    expect(s[0].texto).toBe("Frequência caiu 15 pontos nas últimas 2 semanas");
  });

  it("inatividade ≥ 14 dias, zera ao entrar no navegador demo", () => {
    expect(sinais(aluno({ ultimoAcessoDiasAtras: 14 }), [])[0].texto).toBe("Sem entrar na plataforma há 14 dias");
    expect(sinais(aluno({ ultimoAcessoDiasAtras: 20 }), [], { ultimoAcesso: AGORA }, AGORA)).toEqual([]);
  });

  it("notas em queda em ≥ 2 habilidades", () => {
    expect(sinais(aluno(), [caindo("a")])).toEqual([]);
    expect(sinais(aluno(), [caindo("a"), caindo("b")])[0].tipo).toBe("notas_em_queda");
  });

  it("'Conversei' → acompanhando; sinal novo reabre", () => {
    const s = sinais(aluno({ ultimoAcessoDiasAtras: 20 }), []);
    expect(status(s)).toBe("atencao");
    expect(status(s, { conversouEm: AGORA, nota: "ok", tipos: ["inatividade"] })).toBe("acompanhando");
    const s2 = sinais(aluno({ ultimoAcessoDiasAtras: 20 }), [caindo("a"), caindo("b")]);
    expect(status(s2, { conversouEm: AGORA, nota: "ok", tipos: ["inatividade"] })).toBe("atencao");
  });
});

describe("turma", () => {
  const t = buildClassView(seed, localState(), "2A", AGORA);

  it("2A → EM13MAT316 com 70% em defasagem e no topo do heatmap", () => {
    expect(t.resumo.maiorDefasagem).toEqual({ code: "EM13MAT316", pct: 70 });
    expect(t.heatmap.linhas[0].code).toBe("EM13MAT316");
    expect(t.heatmap.colunas).toHaveLength(10);
  });

  it("colunas em ordem alfabética", () => {
    const nomes = t.heatmap.colunas.map((c) => c.nome);
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, "pt-BR")));
  });

  it("top interesses: futebol, games, empreendedorismo", () => {
    expect(t.resumo.topInteresses).toEqual(["futebol", "games", "empreendedorismo"]);
  });

  it("3 alunos em atenção na 2A, Bruno entre eles", () => {
    expect(t.resumo.atencao).toBe(3);
    expect(t.atencao.map((a) => a.student.id)).toContain("s002");
    expect(t.atencao.find((a) => a.student.id === "s001")).toBeUndefined();
  });
});
