/**
 * Coerência do conteúdo: seed (doc 05) × grafo (D63) × fallbacks (doc 06) × roteiro da demo.
 * Falha com mensagem clara quando um id/código não bate entre módulos.
 */
import { describe, expect, it } from "vitest";
import grafoJson from "@/data/grafo/grafo.json";
import galeraFb from "@/data/fallbacks/galera.json";
import mentorFb from "@/data/fallbacks/mentor.json";
import missaoFb from "@/data/fallbacks/missao.json";
import careersJson from "@/data/seed/careers.json";
import classesJson from "@/data/seed/classes.json";
import frasesJson from "@/data/seed/frases.json";
import mentorsJson from "@/data/seed/mentors.json";
import missoesJson from "@/data/seed/missoes.json";
import scenariosJson from "@/data/seed/scenarios.json";
import skillsJson from "@/data/seed/skills.json";
import { missaoInput } from "../schemas";

type Axis = "analisar" | "tech" | "criar" | "cuidar" | "negocios" | "esportes";
const EIXOS: Axis[] = ["analisar", "tech", "criar", "cuidar", "negocios", "esportes"];
type Perfil = Record<Axis, number>;
const skills = skillsJson as { code: string; area: string; descricaoJovem: string; chunkId: string }[];
const careers = careersJson as unknown as {
  id: string; nome: string; affinity: Perfil; combinaCom: Partial<Record<Axis, string>>; tags: string[];
  interesseQuiz: string; raioX: { t: string; what: string }[]; skills: string[]; escola: Record<string, string>; comoChegar: string;
}[];
const mentors = mentorsJson as unknown as {
  id: string; categoria: string; nivelMinimo: number; careerIds: string[]; affinity: Perfil; disponibilidade: string[]; vagasSemestre: number;
}[];
const scenarios = scenariosJson as { id: string; grupo: string; enunciado: string; opcoes: { key: string; label: string; pesos: Partial<Perfil> }[] }[];
const codigos = new Set(skills.map((s) => s.code));
const careerIds = new Set(careers.map((c) => c.id));

const cos = (a: Perfil, b: Perfil) => {
  let d = 0, na = 0, nb = 0;
  for (const e of EIXOS) { d += a[e] * b[e]; na += a[e] ** 2; nb += b[e] ** 2; }
  return d / Math.sqrt(na * nb);
};

describe("seed (doc 05)", () => {
  it("16 habilidades únicas, 4 por área, chunkId do corpus", () => {
    expect(skills).toHaveLength(16);
    expect(codigos.size).toBe(16);
    for (const a of ["MAT", "LGG", "CNT", "CHS"]) expect(skills.filter((s) => s.area === a)).toHaveLength(4);
    for (const s of skills) expect(s.chunkId).toBe(`bncc-${s.code}`);
  });

  it("15 carreiras completas, ligadas a habilidades existentes, sem salário (D40)", () => {
    expect(careers).toHaveLength(15);
    expect(careerIds.size).toBe(15);
    for (const c of careers) {
      expect(c.raioX, c.id).toHaveLength(3);
      expect(c.skills.every((s) => codigos.has(s)), `${c.id}: habilidade fora do seed`).toBe(true);
      expect(Object.keys(c.escola).sort(), `${c.id}: escola × skills`).toEqual([...c.skills].sort());
      expect(EIXOS.every((e) => c.affinity[e] >= 0 && c.affinity[e] <= 100), c.id).toBe(true);
      expect(missaoInput.safeParse({ skillCode: c.skills[0], interesse: c.interesseQuiz, serie: 2 }).success, `${c.id}: interesseQuiz`).toBe(true);
      expect(c.comoChegar.length).toBeGreaterThan(30);
    }
    expect(JSON.stringify(careersJson)).not.toMatch(/salar|R\$\s?\d/i);
  });

  it("12 mentores: 5 região (nível 1), 4 universitários/técnicos (nível 2), 3 alta demanda (nível 4)", () => {
    expect(mentors).toHaveLength(12);
    const por = (cat: string, nivel: number) => mentors.filter((m) => m.categoria === cat && m.nivelMinimo === nivel).length;
    expect([por("regiao", 1), por("universitario_tecnico", 2), por("alta_demanda", 4)]).toEqual([5, 4, 3]);
    for (const m of mentors) {
      expect(m.careerIds.every((c) => careerIds.has(c)), `${m.id}: carreira inexistente`).toBe(true);
      expect(m.disponibilidade).toHaveLength(3);
      expect(m.vagasSemestre).toBeGreaterThan(0);
    }
  });

  it("toda carreira tem ao menos 1 mentor (detalhe da carreira, D41)", () => {
    for (const c of careers) expect(mentors.some((m) => m.careerIds.includes(c.id)), c.id).toBe(true);
  });

  it("1 missão por habilidade", () => {
    expect((missoesJson as { skillCode: string }[]).map((m) => m.skillCode).sort()).toEqual([...codigos].sort());
  });

  it("Da Galera: 10 cenários + 3 da semana; opções A–D com pesos 0–3; cada eixo ≥ 5 vezes", () => {
    const galera = scenarios.filter((s) => s.grupo === "galera");
    expect(galera.map((s) => s.id)).toEqual(["g01", "g02", "g03", "g04", "g05", "g06", "g07", "g08", "g09", "g10"]);
    expect(scenarios.filter((s) => s.grupo === "semana")).toHaveLength(3);
    for (const s of scenarios) {
      expect(s.opcoes.map((o) => o.key)).toEqual(["A", "B", "C", "D"]);
      for (const o of s.opcoes) {
        const pesos = Object.values(o.pesos);
        expect(pesos.length).toBeGreaterThanOrEqual(1);
        expect(pesos.length).toBeLessThanOrEqual(3);
        expect(pesos.every((p) => p! >= 0 && p! <= 3)).toBe(true);
      }
    }
    for (const e of EIXOS) {
      const n = galera.flatMap((s) => s.opcoes).filter((o) => (o.pesos[e] ?? 0) > 0).length;
      expect(n, `eixo ${e}`).toBeGreaterThanOrEqual(5);
    }
    expect(galera.find((s) => s.id === "g07")!.enunciado).toBe("O grêmio quer fazer o interclasse e ninguém se mexeu. Você…");
  });

  it("15 frases-título, uma por par de eixos", () => {
    const pares = (frasesJson as { eixos: Axis[] }[]).map((f) => [...f.eixos].sort().join("+"));
    expect(new Set(pares).size).toBe(15);
    const f = (frasesJson as { eixos: Axis[]; frase: string }[]).find((x) => x.eixos.includes("analisar") && x.eixos.includes("esportes"));
    expect(f!.frase).toBe("Você curte organizar o caos com números.");
  });

  it("3 turmas", () => expect((classesJson as { id: string }[]).map((c) => c.id)).toEqual(["1A", "2A", "3A"]));
});

describe("roteiro da demo (Kauã)", () => {
  // Perfil típico do Kauã ao terminar o Da Galera (analisar e esportes fortes).
  const kaua: Perfil = { analisar: 85, tech: 40, criar: 45, cuidar: 20, negocios: 50, esportes: 80 };

  it("carreira nº 1 = analista de dados esportivos → missão do dia EM13MAT316", () => {
    const top = [...careers].sort((a, b) => cos(kaua, b.affinity) - cos(kaua, a.affinity));
    expect(top[0].id).toBe("analista-dados-esportivos");
    expect(top[0].skills[0]).toBe("EM13MAT316");
  });

  it("Match Day no nível 4: a analista do clube vence a cientista da Big Tech (afinidade)", () => {
    // Fórmula do doc 07 §6, com Kauã querendo conhecer analista de dados esportivos.
    const score = (m: (typeof mentors)[number]) =>
      40 * cos(kaua, m.affinity) + 25 * (m.careerIds.includes("analista-dados-esportivos") ? 1 : 0) + 15 * Math.min(1, 2 / 3) + 10 * (0.5 * Math.min(1, 4 / 5) + 0.5 * 0.89);
    const candidatos = mentors.filter((m) => m.nivelMinimo <= 4).sort((a, b) => score(b) - score(a) || b.nivelMinimo - a.nivelMinimo);
    expect(candidatos[0].id).toBe("m01-analista-clube");
  });

  it("2A: futebol, games e empreendedorismo existem como tags de carreira", () => {
    const tags = new Set(careers.flatMap((c) => c.tags));
    for (const t of ["futebol", "games", "empreendedorismo"]) expect(tags.has(t), t).toBe(true);
  });
});

describe("coerência entre módulos", () => {
  it("fallbacks de missão só usam habilidades do seed", () => {
    for (const k of Object.keys(missaoFb).filter((k) => k !== "default")) expect(codigos.has(k.split(":")[0]), k).toBe(true);
  });

  it("roteiros do mentor: carreira existe, 3 etapas + pista + critério, desafio na 1ª habilidade da carreira", () => {
    const fb = mentorFb as Record<string, { miniDesafio?: { skillCode: string }; padrao?: string }>;
    const roteiros = [...new Set(Object.keys(fb).map((k) => k.split(":")[0]))].filter((c) => c !== "default");
    for (const c of roteiros) {
      expect(careerIds.has(c), c).toBe(true);
      for (const etapa of ["1", "2", "3", "pista"]) expect(fb, `${c}:${etapa}`).toHaveProperty([`${c}:${etapa}`]);
      const career = careers.find((x) => x.id === c)!;
      expect(fb[`${c}:2`].miniDesafio!.skillCode, c).toBe(career.skills[0]);
      const padrao = fb[`${c}:aceita`]?.padrao ?? fb["default:aceita"].padrao!;
      expect(() => new RegExp(padrao)).not.toThrow();
    }
  });

  it("galera s001 cita carreira existente", () => {
    for (const id of Object.keys(galeraFb.s001.porQueCombina)) expect(careerIds.has(id), id).toBe(true);
  });

  it("grafo: links de quiz apontam para missões que existem; competências BNCC do grafo fora do seed são só do grafo", () => {
    const conteudos = (grafoJson as { conteudos: { id: string; rota?: string }[] }).conteudos;
    for (const c of conteudos.filter((x) => x.rota)) {
      const code = c.rota!.replace("/aluno/missoes/", "");
      expect(codigos.has(code), `${c.id} → ${c.rota}`).toBe(true);
    }
    const doGrafo = (grafoJson as { competencias: { codigo: string; bncc: boolean }[] }).competencias.filter((c) => c.bncc && !codigos.has(c.codigo)).map((c) => c.codigo);
    expect(doGrafo.sort()).toEqual(["EM13MAT104", "EM13MAT203", "EM13MAT303"]);
  });
});
