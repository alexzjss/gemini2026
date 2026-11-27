import { contextoDoGrafo, renderContextoGrafo, type ContextoGrafo } from "@/lib/grafo/contexto";
import type { Grafo } from "@/lib/grafo/grafo";
import type { EstadoAluno } from "@/lib/grafo/tipos";
import { retrieve, type Chunk } from "./retriever";

/**
 * GraphRAG = grafo educacional (competências, pré-requisitos pendentes do aluno, conceitos)
 * + texto LITERAL da BNCC das competências oficiais envolvidas (corpus, busca exata por código).
 * O grafo decide o que é relevante; o corpus dá a evidência citável. Nada é gerado aqui.
 */
export interface ContextoTutor {
  grafo: ContextoGrafo;
  /** `base` primeiro (mantém a numeração [1] da rota), depois os trechos do grafo, sem repetição. */
  chunks: Chunk[];
  /** Bloco <grafo>…</grafo> para o prompt. */
  blocoGrafo: string;
}

export async function montarContextoTutor(
  grafo: Grafo,
  estado: EstadoAluno,
  pergunta: string,
  o: { base?: Chunk[]; maxChunks?: number } = {},
): Promise<ContextoTutor> {
  const ctx = contextoDoGrafo(grafo, estado, pergunta);
  const base = o.base ?? [];
  const faltam = ctx.codigosBncc.filter((c) => !base.some((b) => b.ref === c)).slice(0, o.maxChunks ?? 3);
  const extra = faltam.length
    ? await retrieve(faltam.join(" "), { k: faltam.length, sources: ["bncc"], exato: true, rotulo: "graphrag" })
    : [];
  return { grafo: ctx, chunks: [...base, ...extra], blocoGrafo: renderContextoGrafo(ctx) };
}
