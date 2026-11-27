/**
 * Limite de chamadas por IP (token bucket em memória, por instância serverless).
 * É contenção contra abuso de cota do Gemini, não garantia global: cada instância
 * da Vercel tem o próprio balde. Configurável por RATE_LIMIT_POR_MIN (padrão 30).
 */
const POR_MIN = Number(process.env.RATE_LIMIT_POR_MIN ?? 30);
const MAX_CHAVES = 5_000;

const baldes = new Map<string, { tokens: number; ts: number }>();

export function ipDaRequisicao(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim() || "local";
}

/** Consome 1 ficha. Devolve null se liberado, ou os segundos até a próxima ficha. */
export function consumir(chave: string, agora = Date.now()): number | null {
  if (!(POR_MIN > 0)) return null;
  if (baldes.size > MAX_CHAVES) baldes.clear();
  const porMs = POR_MIN / 60_000;
  const b = baldes.get(chave) ?? { tokens: POR_MIN, ts: agora };
  b.tokens = Math.min(POR_MIN, b.tokens + (agora - b.ts) * porMs);
  b.ts = agora;
  if (b.tokens < 1) {
    baldes.set(chave, b);
    return Math.ceil((1 - b.tokens) / porMs / 1000);
  }
  b.tokens -= 1;
  baldes.set(chave, b);
  return null;
}

/** Só para testes. */
export function _resetRateLimit() {
  baldes.clear();
}
