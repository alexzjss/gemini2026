import { createHash } from "node:crypto";

/**
 * Hash estável do conteúdo de um chunk. Usado por scripts/montar-corpus.ts (campo `hash`),
 * scripts/embed-corpus.ts (reprocessamento incremental) e pelo retriever (descarta vetores velhos).
 */
export function hashChunk(c: { ref: string; titulo: string; texto: string }): string {
  return createHash("sha256").update(`${c.ref}\n${c.titulo}\n${c.texto}`).digest("hex").slice(0, 16);
}

export function hashLista(hashes: string[]): string {
  return createHash("sha256").update(hashes.join("|")).digest("hex").slice(0, 16);
}

/** Texto enviado ao modelo de embedding (igual na indexação e nos testes). */
export function textoParaEmbedding(c: { ref: string; titulo: string; texto: string }): string {
  return `${c.ref} ${c.titulo}\n${c.texto}`;
}
