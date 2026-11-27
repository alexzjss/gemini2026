import { describe, expect, it } from "vitest";
import { combina, filaSwipe, ondeAEscolaAparece, rankCarreiras } from "../carreiras";
import { seed } from "./fixtures";
import type { SkillStatus } from "../../types";

const p = { analisar: 90, tech: 30, criar: 40, cuidar: 20, negocios: 45, esportes: 80 };
const vazio = { salvas: [], queroConhecer: [], passadas: [] };

describe("carreiras", () => {
  it("bônus de salva (+0,15) e quero conhecer (+0,25)", () => {
    const base = rankCarreiras(p, seed.careers);
    const ultima = base[base.length - 1].career.id;
    const com = rankCarreiras(p, seed.careers, { ...vazio, salvas: [ultima] });
    const r = com.find((x) => x.career.id === ultima)!;
    expect(r.score - r.similaridade).toBeCloseTo(0.15);
    const q = rankCarreiras(p, seed.careers, { ...vazio, queroConhecer: [ultima] }).find((x) => x.career.id === ultima)!;
    expect(q.score - q.similaridade).toBeCloseTo(0.25);
  });

  it("carreira passada vai pro fim e não some", () => {
    const fila = filaSwipe(p, seed.careers, { ...vazio, passadas: ["analista-dados-esportivos"] });
    expect(fila).toHaveLength(15);
    expect(fila[fila.length - 1].id).toBe("analista-dados-esportivos");
  });

  it("nenhuma carreira é removida por nota", () => {
    const tudoDefasagem: SkillStatus[] = seed.skills.map((s) => ({ code: s.code, level: "defasagem", media: 1, tendencia: "caindo", progresso: 10 }));
    expect(filaSwipe(p, seed.careers)).toHaveLength(seed.careers.length);
    for (const c of seed.careers) expect(ondeAEscolaAparece(c, tudoDefasagem)).toBeDefined();
  });

  it("combina: usa os rótulos curtos da carreira", () => {
    const c = seed.careers.find((x) => x.id === "analista-dados-esportivos")!;
    expect(combina(p, c)).toEqual(["números", "futebol"]);
  });

  it("onde a escola aparece: 1ª não dominada; todas dominadas → a 1ª", () => {
    const c = seed.careers.find((x) => x.id === "analista-dados-esportivos")!;
    const st = (code: string, level: SkillStatus["level"]): SkillStatus => ({ code, level, media: 7, tendencia: "estavel", progresso: 50 });
    expect(ondeAEscolaAparece(c, [st("EM13MAT316", "dominada"), st("EM13MAT310", "defasagem")])?.code).toBe("EM13MAT310");
    expect(ondeAEscolaAparece(c, c.skills.map((s) => st(s, "dominada")))?.code).toBe("EM13MAT316");
  });

  it("seed tem 15 carreiras com 3 itens de raio-x e frase para cada habilidade", () => {
    expect(seed.careers).toHaveLength(15);
    for (const c of seed.careers) {
      expect(c.raioX).toHaveLength(3);
      for (const s of c.skills) expect(c.escola[s], `${c.id} ${s}`).toBeTruthy();
    }
  });
});
