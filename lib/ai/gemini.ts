import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import type { z } from "zod";

/**
 * Cliente Gemini do servidor. Sem GEMINI_API_KEY, tudo cai no fallback
 * (a demo roda 100% offline). A chave nunca vai ao cliente.
 */

/** Interface mínima usada aqui (permite um cliente falso nos testes). */
export interface ClienteIA {
  models: {
    generateContent: GoogleGenAI["models"]["generateContent"];
    embedContent: GoogleGenAI["models"]["embedContent"];
  };
}

const apiKey = process.env.GEMINI_API_KEY;
let ai: ClienteIA | null = apiKey ? new GoogleGenAI({ apiKey }) : null;

/** Só para testes: troca o cliente (null = offline). */
export function _setClienteIA(c: ClienteIA | null) {
  ai = c;
}

export const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
export const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL ?? "text-embedding-004";

/**
 * Prazo total de uma rota (busca + geração + nova tentativa), abaixo do maxDuration 30s
 * da Vercel, para a rota sempre responder com fallback em vez de ser cortada (504).
 */
export const PRAZO_ROTA_MS = Number(process.env.AI_PRAZO_MS ?? 20_000);
const TENTATIVA_MS = 15_000;
const MIN_TENTATIVA_MS = 2_500;

export type Source = "ai" | "fallback";

export function hasAI(): boolean {
  return ai !== null;
}

/** Público de 14 a 18 anos: bloqueia a partir de probabilidade baixa. */
const SAFETY = [
  HarmCategory.HARM_CATEGORY_HARASSMENT,
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
].map((category) => ({ category, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE }));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Log estruturado (1 linha JSON). Nunca inclui texto do usuário nem dados pessoais. */
export function logIA(evento: Record<string, unknown>) {
  console.info(JSON.stringify({ t: new Date().toISOString(), ...evento }));
}

/** Executa `fn` com um AbortSignal que dispara após `ms`. */
export async function withTimeout<T>(ms: number, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      ctrl.abort();
      reject(new Error(`timeout ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([fn(ctrl.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/** Erros 4xx (exceto 408/429) não melhoram com nova tentativa: chave inválida, pedido malformado. */
export function valeTentarDeNovo(e: unknown): boolean {
  const status = (e as { status?: unknown })?.status;
  if (typeof status !== "number") return true; // timeout, rede, parse
  return status === 408 || status === 429 || status >= 500;
}

export async function generateJson<T>(o: {
  system: string;
  user: string;
  /** Subset OpenAPI aceito pelo Gemini (ver lib/ai/schemas.ts). */
  responseSchema: object;
  zod: z.ZodType<T>;
  fallback: () => T;
  temperature?: number;
  postprocess?: (t: T) => T;
  /**
   * Guardrail de saída: devolve um motivo para rejeitar a resposta (conta como falha:
   * tenta de novo e depois cai no fallback) ou null para aceitar.
   */
  validar?: (t: T) => string | null;
  /** Epoch ms em que a rota precisa ter respondido. */
  deadline?: number;
  /** Rótulo para logs (sem dados pessoais). */
  rota?: string;
}): Promise<{ data: T; source: Source }> {
  const inicio = Date.now();
  const deadline = o.deadline ?? inicio + PRAZO_ROTA_MS;
  const viaFallback = (motivo: string) => {
    const data = o.fallback();
    logIA({ rota: o.rota, etapa: "gerar", source: "fallback", motivo, ms: Date.now() - inicio });
    return { data: o.postprocess ? o.postprocess(data) : data, source: "fallback" as const };
  };
  if (!ai) return viaFallback("sem_chave");
  const cliente = ai;

  let motivo = "prazo";
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    const restante = deadline - Date.now() - 300;
    if (restante < MIN_TENTATIVA_MS) break;
    try {
      const res = await withTimeout(Math.min(TENTATIVA_MS, restante), (signal) =>
        cliente.models.generateContent({
          model: MODEL,
          contents: o.user,
          config: {
            systemInstruction: o.system,
            responseMimeType: "application/json",
            responseSchema: o.responseSchema,
            temperature: o.temperature ?? 0.6,
            safetySettings: SAFETY,
            abortSignal: signal,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      );
      // Resposta bloqueada pelo filtro de segurança chega sem texto.
      if (!res.text) {
        motivo = "bloqueio_ou_vazio";
      } else {
        const parsed = o.zod.safeParse(JSON.parse(res.text));
        if (!parsed.success) {
          motivo = "schema";
        } else {
          const data = o.postprocess ? o.postprocess(parsed.data) : parsed.data;
          const rejeicao = o.validar?.(data) ?? null;
          if (!rejeicao) {
            logIA({ rota: o.rota, etapa: "gerar", source: "ai", tentativa, ms: Date.now() - inicio });
            return { data, source: "ai" };
          }
          motivo = `guardrail:${rejeicao}`;
        }
      }
      logIA({ rota: o.rota, etapa: "gerar", rejeitada: motivo, tentativa });
    } catch (e) {
      motivo = (e as Error).message?.startsWith("timeout") ? "timeout" : `erro:${(e as { status?: number }).status ?? "rede"}`;
      logIA({ rota: o.rota, etapa: "gerar", falha: motivo, tentativa });
      if (!valeTentarDeNovo(e)) break;
    }
    await sleep(400);
  }
  return viaFallback(motivo);
}

/** Embedding de uma query (retriever). Devolve null em qualquer falha. */
export async function embedQuery(
  text: string,
  o: { model: string; dim?: number; timeoutMs?: number },
): Promise<number[] | null> {
  if (!ai) return null;
  const cliente = ai;
  try {
    const r = await withTimeout(o.timeoutMs ?? 3_000, (signal) =>
      cliente.models.embedContent({
        model: o.model,
        contents: text,
        config: {
          taskType: "RETRIEVAL_QUERY",
          ...(o.dim ? { outputDimensionality: o.dim } : {}),
          abortSignal: signal,
        },
      }),
    );
    return r.embeddings?.[0]?.values ?? null;
  } catch (e) {
    logIA({ etapa: "embed_query", falha: (e as Error).message?.slice(0, 80) });
    return null;
  }
}
