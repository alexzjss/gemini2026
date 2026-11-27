import bnccJson from "@/data/corpus/bncc-em.json";
import referencialJson from "@/data/corpus/referencial-ia.json";
import embeddingsJson from "@/data/corpus.embeddings.json";
import { embedQuery, logIA } from "@/lib/ai/gemini";
import { hashChunk } from "./hash";

/**
 * RAG em memória sobre o corpus curado (BNCC EM + Referencial de IA na Educação).
 * Os textos são literais dos documentos oficiais (scripts/montar-corpus.ts).
 *
 * Ordem de busca:
 *  1) códigos BNCC na query → chunks exatos (+ competência específica, se `relacionados`)
 *  2) cosseno entre o embedding da query e data/corpus.embeddings.json (só vetores com hash atual)
 *  3) se o embedding falhar → sobreposição de tokens
 * Nos passos 2 e 3, só entra o que passar do limiar: contexto irrelevante é pior que nenhum.
 */

export type CorpusSource = "bncc" | "referencial";
export type ChunkTipo = "habilidade" | "competencia" | "area" | "referencial";

export interface Chunk {
  id: string;
  source: CorpusSource;
  ref: string;
  titulo: string;
  fonte: string;
  texto: string;
  area?: "MAT" | "LGG" | "CNT" | "CHS" | null;
  tipo?: ChunkTipo;
  hash?: string;
}

export interface EmbeddingsFile {
  model: string;
  dim?: number;
  taskType?: string;
  corpusHash?: string;
  items: { id: string; hash?: string; vector: number[] }[];
}

export interface RetrieveOpts {
  k?: number;
  sources?: CorpusSource[];
  /** Inclui a competência específica de cada código encontrado. */
  relacionados?: boolean;
  /** Só chunks com ref igual a um código da query (sem busca semântica nem lexical). */
  exato?: boolean;
  /** Limiar de cosseno (padrão 0.55). */
  minCosseno?: number;
  /** Mínimo de tokens em comum na busca lexical (padrão 2). */
  minTokens?: number;
  /** Rótulo para log. */
  rotulo?: string;
}

export interface Resultado {
  chunk: Chunk;
  score: number;
  metodo: "exato" | "cosseno" | "lexical";
}

export const CODIGO_BNCC = /EM13[A-Z]{2,3}\d{2,3}/g;
const MIN_COSSENO = 0.55;
const MIN_TOKENS = 2;

/** EM13MAT316 → "CE3-MAT" (o 1º dígito da habilidade é a competência específica). */
export function competenciaRef(code: string): string | null {
  const m = /^EM13(MAT|LGG|CNT|CHS)(\d)\d{2}$/.exec(code);
  return m ? `CE${m[2]}-${m[1]}` : null;
}

/* ---------- busca lexical ---------- */

const STOPWORDS = new Set(
  "a o as os um uma uns umas de do da dos das em no na nos nas por pra para com sem que se e ou ao aos à às como mais menos sua seu suas seus ser ter sobre entre".split(
    " ",
  ),
);

export function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/* ---------- busca vetorial ---------- */

export function cosseno(a: number[], b: number[]): number {
  if (a.length !== b.length || !a.length) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/* ---------- retriever ---------- */

export function criarRetriever(
  chunks: Chunk[],
  emb: EmbeddingsFile,
  embed: (q: string) => Promise<number[] | null>,
) {
  const tokensPorChunk = new Map(chunks.map((c) => [c.id, new Set(tokens(`${c.ref} ${c.titulo} ${c.texto}`))]));

  // Só vetores do modelo/dimensão declarados e com hash igual ao do texto atual do chunk.
  const vetores = new Map<string, number[]>();
  let descartados = 0;
  const dim = emb.dim ?? emb.items[0]?.vector.length;
  for (const it of emb.items ?? []) {
    const c = chunks.find((x) => x.id === it.id);
    const hashAtual = c ? (c.hash ?? hashChunk(c)) : null;
    if (!c || (it.hash && it.hash !== hashAtual) || it.vector.length !== dim) descartados++;
    else vetores.set(it.id, it.vector);
  }
  if (descartados) logIA({ etapa: "retriever_init", aviso: "vetores_descartados", descartados });
  const semVetor = chunks.filter((c) => !vetores.has(c.id)).length;
  if (vetores.size && semVetor) logIA({ etapa: "retriever_init", aviso: "chunks_sem_vetor", semVetor });

  const cacheQuery = new Map<string, number[] | null>();
  async function vetorDaQuery(q: string) {
    if (!vetores.size || !emb.model) return null;
    if (!cacheQuery.has(q)) {
      if (cacheQuery.size > 500) cacheQuery.clear();
      const v = await embed(q);
      if (v && v.length !== dim) logIA({ etapa: "embed_query", aviso: "dimensao_diferente", esperado: dim, veio: v.length });
      // Dimensão diferente → sem vetor (cai na busca lexical em vez de zerar o resultado).
      cacheQuery.set(q, v && v.length === dim ? v : null);
    }
    return cacheQuery.get(q)!;
  }

  async function buscar(query: string, o: RetrieveOpts = {}): Promise<Resultado[]> {
    const inicio = Date.now();
    const k = o.k ?? 4;
    const pool = o.sources ? chunks.filter((c) => o.sources!.includes(c.source)) : chunks;
    const out: Resultado[] = [];
    const add = (r: Resultado) => {
      if (out.length < k && !out.some((x) => x.chunk.id === r.chunk.id)) out.push(r);
    };
    const fim = () => {
      logIA({
        etapa: "retrieve",
        rotulo: o.rotulo,
        ms: Date.now() - inicio,
        chunks: out.map((r) => `${r.chunk.id}:${r.metodo}:${r.score.toFixed(2)}`),
      });
      return out;
    };
    if (!pool.length || k <= 0) return fim();

    // 1) códigos exatos
    const codigos = [...new Set(query.match(CODIGO_BNCC) ?? [])];
    for (const code of codigos) {
      const c = pool.find((x) => x.ref === code);
      if (c) add({ chunk: c, score: 1, metodo: "exato" });
    }
    if (o.relacionados) {
      for (const code of codigos) {
        const ce = competenciaRef(code);
        const c = ce ? pool.find((x) => x.ref === ce) : undefined;
        if (c) add({ chunk: c, score: 1, metodo: "exato" });
      }
    }
    if (o.exato || out.length >= k) return fim();

    const resto = pool.filter((c) => !out.some((x) => x.chunk.id === c.id));

    // 2) cosseno com limiar
    const qv = await vetorDaQuery(query);
    if (qv) {
      const min = o.minCosseno ?? MIN_COSSENO;
      resto
        .filter((c) => vetores.has(c.id))
        .map((c) => ({ c, s: cosseno(qv, vetores.get(c.id)!) }))
        .filter((x) => x.s >= min)
        .sort((a, b) => b.s - a.s)
        .forEach(({ c, s }) => add({ chunk: c, score: s, metodo: "cosseno" }));
      return fim();
    }

    // 3) lexical com mínimo de tokens em comum (empate: ordem do corpus)
    const qt = new Set(tokens(query));
    const min = o.minTokens ?? MIN_TOKENS;
    resto
      .map((c, i) => {
        let s = 0;
        for (const t of tokensPorChunk.get(c.id)!) if (qt.has(t)) s++;
        return { c, s, i };
      })
      .filter((x) => x.s >= min)
      .sort((a, b) => b.s - a.s || a.i - b.i)
      .forEach(({ c, s }) => add({ chunk: c, score: s, metodo: "lexical" }));
    return fim();
  }

  return {
    corpus: (): readonly Chunk[] => chunks,
    chunkById: (id: string) => chunks.find((c) => c.id === id),
    buscar,
    retrieve: async (q: string, o?: RetrieveOpts) => (await buscar(q, o)).map((r) => r.chunk),
  };
}

/* ---------- instância padrão (corpus versionado) ---------- */

const EMB = embeddingsJson as EmbeddingsFile;
const padrao = criarRetriever(
  [...(bnccJson as Chunk[]), ...(referencialJson as Chunk[])],
  EMB,
  (q) => embedQuery(q, { model: EMB.model, dim: EMB.dim }),
);

export const corpus = padrao.corpus;
export const chunkById = padrao.chunkById;
export const retrieve = padrao.retrieve;
export const buscar = padrao.buscar;
