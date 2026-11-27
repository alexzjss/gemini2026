/**
 * npm run embed — gera data/corpus.embeddings.json a partir de data/corpus/*.json.
 *
 * - Modelo: GEMINI_EMBED_MODEL (padrão text-embedding-004); se falhar, tenta gemini-embedding-001.
 * - taskType RETRIEVAL_DOCUMENT aqui e RETRIEVAL_QUERY no retriever; dimensão fixa (EMBED_DIM, padrão 768)
 *   nos dois lados. Modelo, dimensão e taskType ficam gravados no arquivo e o retriever usa os mesmos.
 * - Incremental: reaproveita vetores cujo hash do chunk não mudou (mesmo modelo e dimensão).
 *   --tudo força reprocessar tudo.
 * - Retry com backoff exponencial em 429/5xx/timeout.
 * Precisa de GEMINI_API_KEY.
 */
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { hashChunk, hashLista, textoParaEmbedding } from "../lib/rag/hash";

interface Chunk { id: string; ref: string; titulo: string; texto: string; hash?: string }
interface Item { id: string; hash: string; vector: number[] }
interface Arquivo { model: string; dim: number; taskType: string; corpusHash: string; items: Item[] }

const ROOT = process.cwd();
const SAIDA = path.join(ROOT, "data/corpus.embeddings.json");
const DIM = Number(process.env.EMBED_DIM ?? 768);
const TASK = "RETRIEVAL_DOCUMENT";
const TUDO = process.argv.includes("--tudo");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY não definida. Ex.: GEMINI_API_KEY=... npm run embed");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });
const MODELOS = [...new Set([process.env.GEMINI_EMBED_MODEL ?? "text-embedding-004", "gemini-embedding-001"])];

const chunks: (Chunk & { hash: string })[] = ["data/corpus/bncc-em.json", "data/corpus/referencial-ia.json"]
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")) as Chunk[])
  .map((c) => ({ ...c, hash: c.hash ?? hashChunk(c) }));
if (!chunks.length) {
  console.error("❌ Corpus vazio. Rode npm run corpus depois de preencher data/corpus/raw/*.txt.");
  process.exit(1);
}

function anterior(): Arquivo | null {
  try {
    const a = JSON.parse(fs.readFileSync(SAIDA, "utf8")) as Arquivo;
    return a.model && a.items?.length ? a : null;
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function embedComRetry(model: string, c: Chunk, tentativas = 4): Promise<number[]> {
  for (let n = 0; ; n++) {
    try {
      const r = await ai.models.embedContent({
        model,
        contents: textoParaEmbedding(c),
        config: { taskType: TASK, title: `${c.ref} ${c.titulo}`, outputDimensionality: DIM },
      });
      const v = r.embeddings?.[0]?.values;
      if (!v?.length) throw new Error(`embedding vazio para ${c.id}`);
      if (v.length !== DIM) throw new Error(`dimensão ${v.length} ≠ ${DIM} (${c.id})`);
      return v;
    } catch (e) {
      const status = (e as { status?: number }).status;
      const retentavel = status === undefined || status === 429 || status >= 500;
      if (!retentavel || n + 1 >= tentativas) throw e;
      const espera = 1_000 * 2 ** n;
      process.stdout.write(`\n  ${c.id}: ${status ?? "rede"}, nova tentativa em ${espera / 1000}s`);
      await sleep(espera);
    }
  }
}

async function embedTodos(model: string): Promise<{ items: Item[]; reaproveitados: number }> {
  const prev = anterior();
  const reaproveitavel =
    !TUDO && prev && prev.model === model && prev.dim === DIM && prev.taskType === TASK
      ? new Map(prev.items.map((i) => [i.id, i]))
      : new Map<string, Item>();
  const items: Item[] = [];
  let reaproveitados = 0;
  for (const [n, c] of chunks.entries()) {
    const old = reaproveitavel.get(c.id);
    if (old && old.hash === c.hash && old.vector.length === DIM) {
      items.push(old);
      reaproveitados++;
    } else {
      items.push({ id: c.id, hash: c.hash, vector: await embedComRetry(model, c) });
    }
    process.stdout.write(`\r${model}: ${n + 1}/${chunks.length}`);
  }
  process.stdout.write("\n");
  return { items, reaproveitados };
}

async function main() {
  for (const model of MODELOS) {
    try {
      const { items, reaproveitados } = await embedTodos(model);
      const arquivo: Arquivo = {
        model,
        dim: DIM,
        taskType: TASK,
        corpusHash: hashLista(chunks.map((c) => c.hash)),
        items,
      };
      fs.writeFileSync(SAIDA, JSON.stringify(arquivo));
      console.log(
        `✓ data/corpus.embeddings.json: ${items.length} vetores (${model}, dim ${DIM}; ${reaproveitados} reaproveitados, ${items.length - reaproveitados} novos)`,
      );
      return;
    } catch (e) {
      console.warn(`\n⚠️  ${model} falhou: ${(e as Error).message}`);
    }
  }
  console.error("❌ Nenhum modelo de embedding funcionou. O retriever segue por palavra-chave.");
  process.exit(1);
}

main();
