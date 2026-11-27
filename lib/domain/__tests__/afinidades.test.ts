import { describe, expect, it } from "vitest";
import { fraseTitulo, perfil, perfilParcial, rotulo, top } from "../afinidades";
import { seed } from "./fixtures";

const galera = seed.scenarios.filter((c) => c.grupo === "galera");

describe("afinidades", () => {
  it("normaliza 0–100 pelo máximo possível dos cenários respondidos", () => {
    const g07 = galera.find((c) => c.id === "g07")!;
    const p = perfil({ g07: "A" }, [g07]);
    expect(p.analisar).toBe(100); // 3 de 3
    expect(p.esportes).toBe(50); // 1 de 2
    expect(p.negocios).toBe(0);
  });

  it("todas as respostas iguais ao máximo dão 100 nos eixos escolhidos", () => {
    const respostas = Object.fromEntries(galera.map((c) => [c.id, "A"]));
    const p = perfil(respostas, galera);
    for (const v of Object.values(p)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("rótulos 65 / 35", () => {
    expect(rotulo(65)).toBe("forte");
    expect(rotulo(64)).toBe("médio");
    expect(rotulo(35)).toBe("médio");
    expect(rotulo(34)).toBe("leve");
  });

  it("top n ordena e desempata pela ordem dos eixos", () => {
    const t = top({ analisar: 50, tech: 50, criar: 10, cuidar: 90, negocios: 0, esportes: 20 }, 3);
    expect(t.map((x) => x.eixo)).toEqual(["cuidar", "analisar", "tech"]);
  });

  it("frase do par analisar + esportes", () => {
    const f = fraseTitulo({ analisar: 90, tech: 10, criar: 10, cuidar: 10, negocios: 20, esportes: 80 }, seed.frases);
    expect(f).toBe("Você curte organizar o caos com números.");
  });

  it("frases cobrem os 15 pares", () => {
    const pares = new Set(seed.frases.map((f) => [...f.eixos].sort().join("+")));
    expect(pares.size).toBe(15);
  });

  it("parcial só a partir do 3º cenário", () => {
    expect(perfilParcial({ g01: "A", g02: "A" }, galera)).toBeNull();
    expect(perfilParcial({ g01: "A", g02: "A", g03: "A" }, galera)).not.toBeNull();
  });

  it("cada eixo aparece em pelo menos 5 opções do Da Galera", () => {
    for (const eixo of ["analisar", "tech", "criar", "cuidar", "negocios", "esportes"] as const) {
      const n = galera.flatMap((c) => c.opcoes).filter((o) => (o.pesos[eixo] ?? 0) > 0).length;
      expect(n, eixo).toBeGreaterThanOrEqual(5);
    }
  });
});
