import { NextResponse } from "next/server";
import type { z } from "zod";
import { logIA, PRAZO_ROTA_MS, type Source } from "./gemini";
import { consumir, ipDaRequisicao } from "./ratelimit";

const MAX_BODY_BYTES = 32_000;

export interface Contexto {
  /** Epoch ms até quando a rota precisa responder (busca + geração). */
  deadline: number;
}

/**
 * Monta o handler POST de uma rota de IA:
 * - limite de chamadas por IP → 429 com Retry-After;
 * - corpo > 32 KB → 413; JSON inválido ou fora do zod → 400;
 * - prazo único de PRAZO_ROTA_MS para busca + geração (abaixo do maxDuration);
 * - qualquer exceção inesperada → `emErro(input)` (fallback), nunca 500 na demo.
 * Resposta sempre `{ data, source }`.
 */
export function rotaIA<I, O>(o: {
  nome: string;
  input: z.ZodType<I>;
  run: (input: I, ctx: Contexto) => Promise<{ data: O; source: Source }>;
  emErro: (input: I) => { data: O; source: Source };
}) {
  return async function POST(req: Request): Promise<Response> {
    const inicio = Date.now();
    const responder = (body: unknown, status: number, extra: Record<string, unknown> = {}, headers?: HeadersInit) => {
      logIA({ rota: o.nome, etapa: "http", status, ms: Date.now() - inicio, ...extra });
      return NextResponse.json(body, { status, headers });
    };

    const espera = consumir(`${o.nome}:${ipDaRequisicao(req)}`);
    if (espera !== null) {
      return responder({ error: "muitas requisições, tente em instantes" }, 429, {}, { "Retry-After": String(espera) });
    }

    let body: unknown;
    try {
      const raw = await req.text();
      if (raw.length > MAX_BODY_BYTES) return responder({ error: "corpo grande demais" }, 413);
      body = JSON.parse(raw);
    } catch {
      return responder({ error: "JSON inválido" }, 400);
    }
    const parsed = o.input.safeParse(body);
    if (!parsed.success) {
      return responder(
        {
          error: "entrada inválida",
          issues: parsed.error.issues.slice(0, 5).map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        400,
      );
    }
    try {
      const r = await o.run(parsed.data, { deadline: inicio + PRAZO_ROTA_MS });
      return responder(r, 200, { source: r.source });
    } catch (e) {
      logIA({ rota: o.nome, etapa: "erro_inesperado", erro: (e as Error).message?.slice(0, 120) });
      try {
        return responder(o.emErro(parsed.data), 200, { source: "fallback" });
      } catch (e2) {
        logIA({ rota: o.nome, etapa: "fallback_falhou", erro: (e2 as Error).message?.slice(0, 120) });
        return responder({ error: "indisponível" }, 503);
      }
    }
  };
}

/** Corta no limite, preferindo o fim de uma frase ou palavra. */
export function cortar(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  const fimFrase = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf("! "), corte.lastIndexOf("? "));
  if (fimFrase > max * 0.6) return corte.slice(0, fimFrase + 1);
  const fimPalavra = corte.lastIndexOf(" ");
  return `${corte.slice(0, fimPalavra > 0 ? fimPalavra : corte.length)}…`;
}

/** "Estatística: média…" → "estatística: média…" (meio da frase). Siglas e códigos ("EM13…", "UX") ficam iguais. */
export function minuscula(s: string): string {
  if (!s || /^[A-Z0-9]{2}/.test(s)) return s;
  return s[0].toLowerCase() + s.slice(1);
}

/** "Estatística: média, moda e mediana" → "estatística" (termo curto, sem os dois-pontos). */
export function termo(descricao: string): string {
  return minuscula(descricao.split(":")[0].trim());
}
