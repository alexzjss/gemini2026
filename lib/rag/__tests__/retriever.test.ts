import { describe, expect, it, vi } from "vitest";
import { hashChunk } from "../hash";
import { competenciaRef, cosseno, criarRetriever, type Chunk, type EmbeddingsFile } from "../retriever";

// Textos FICTÍCIOS de teste (o corpus real é literal da BNCC/Referencial e não é usado aqui).
const mk = (id: string, ref: string, source: Chunk["source"], texto: string): Chunk => ({
  id, ref, source, titulo: ref, fonte: "teste", texto,
});
const CHUNKS: Chunk[] = [
  mk("bncc-EM13MAT316", "EM13MAT316", "bncc", "texto ficticio sobre estatistica media mediana desvio dados"),
  mk("bncc-CE3-MAT", "CE3-MAT", "bncc", "texto ficticio competencia resolver problemas matematica"),
  mk("bncc-EM13MAT310", "EM13MAT310", "bncc", "texto ficticio contagem combinacoes agrupamentos"),
  mk("bncc-EM13LGG303", "EM13LGG303", "bncc", "texto ficticio debate argumento ponto de vista"),
  mk("ref-CRITICO", "REF-CRITICO", "referencial", "texto ficticio pensamento critico autonomia docente"),
];
const VAZIO: EmbeddingsFile = { model: "", items: [] };
const semEmbed = async () => null;

describe("competenciaRef", () => {
  it("deriva a competência específica do código", () => {
    expect(competenciaRef("EM13MAT316")).toBe("CE3-MAT");
    expect(competenciaRef("EM13LGG701")).toBe("CE7-LGG");
    expect(competenciaRef("EM13LP01")).toBeNull();
  });
});

describe("cosseno", () => {
  it("dimensões diferentes não contam (-1)", () => {
    expect(cosseno([1, 0], [1, 0, 0])).toBe(-1);
    expect(cosseno([1, 0], [1, 0])).toBeCloseTo(1);
  });
});

describe("retrieve", () => {
  const r = criarRetriever(CHUNKS, VAZIO, semEmbed);

  it("código exato vem primeiro, depois a competência", async () => {
    const out = await r.retrieve("EM13MAT316 estatistica futebol", { k: 4, sources: ["bncc"], relacionados: true });
    expect(out.slice(0, 2).map((c) => c.ref)).toEqual(["EM13MAT316", "CE3-MAT"]);
  });

  it("exato: não completa com outros chunks", async () => {
    expect((await r.retrieve("EM13MAT316", { k: 3, exato: true })).map((c) => c.ref)).toEqual(["EM13MAT316"]);
    expect(await r.retrieve("EM13CHS101", { k: 1, exato: true })).toEqual([]);
  });

  it("busca lexical respeita o mínimo de tokens (contexto irrelevante não entra)", async () => {
    expect(await r.retrieve("receita de bolo de cenoura", { k: 4 })).toEqual([]);
    const out = await r.retrieve("contagem combinacoes", { k: 4 });
    expect(out.map((c) => c.ref)).toEqual(["EM13MAT310"]);
  });

  it("filtra por source", async () => {
    const out = await r.retrieve("pensamento critico autonomia docente", { k: 2, sources: ["referencial"] });
    expect(out.every((c) => c.source === "referencial")).toBe(true);
  });

  it("corpus vazio devolve []", async () => {
    const vazio = criarRetriever([], VAZIO, semEmbed);
    expect(await vazio.retrieve("EM13MAT316", { k: 4 })).toEqual([]);
  });
});

describe("retrieve com embeddings", () => {
  const vet: Record<string, number[]> = {
    "bncc-EM13MAT316": [1, 0, 0],
    "bncc-CE3-MAT": [0.9, 0.1, 0],
    "bncc-EM13MAT310": [0, 1, 0],
    "bncc-EM13LGG303": [0, 0, 1],
    "ref-CRITICO": [0.7, 0.7, 0],
  };
  const emb: EmbeddingsFile = {
    model: "fake",
    dim: 3,
    items: CHUNKS.map((c) => ({ id: c.id, hash: hashChunk(c), vector: vet[c.id] })),
  };

  it("ordena por cosseno e corta abaixo do limiar", async () => {
    const r = criarRetriever(CHUNKS, emb, async () => [1, 0, 0]);
    const out = await r.buscar("estatistica", { k: 5, minCosseno: 0.5 });
    expect(out.map((x) => x.chunk.id)).toEqual(["bncc-EM13MAT316", "bncc-CE3-MAT", "ref-CRITICO"]);
    expect(out.every((x) => x.metodo === "cosseno" && x.score >= 0.5)).toBe(true);
  });

  it("vetor com hash velho é descartado (texto mudou depois do embed)", async () => {
    const velho: EmbeddingsFile = { ...emb, items: emb.items.map((i) => (i.id === "bncc-EM13MAT316" ? { ...i, hash: "velho" } : i)) };
    const r = criarRetriever(CHUNKS, velho, async () => [1, 0, 0]);
    const out = await r.retrieve("estatistica", { k: 5, minCosseno: 0.5 });
    expect(out.map((c) => c.id)).not.toContain("bncc-EM13MAT316");
  });

  it("falha no embedding da query → busca lexical", async () => {
    const embed = vi.fn(async () => null);
    const r = criarRetriever(CHUNKS, emb, embed);
    const out = await r.buscar("contagem combinacoes", { k: 2 });
    expect(embed).toHaveBeenCalledOnce();
    expect(out[0]).toMatchObject({ metodo: "lexical" });
  });

  it("query com dimensão diferente → busca lexical, não resultado vazio", async () => {
    const r = criarRetriever(CHUNKS, emb, async () => [1, 0]);
    const out = await r.buscar("contagem combinacoes", { k: 2 });
    expect(out.map((x) => x.chunk.ref)).toEqual(["EM13MAT310"]);
  });

  it("exato não chama o embedding", async () => {
    const embed = vi.fn(async () => [1, 0, 0]);
    const r = criarRetriever(CHUNKS, emb, embed);
    await r.retrieve("EM13MAT316", { k: 1, exato: true });
    expect(embed).not.toHaveBeenCalled();
  });
});
