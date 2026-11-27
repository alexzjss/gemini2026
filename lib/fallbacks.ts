import diagnostico from "@/data/fallbacks/diagnostico.json";
import galera from "@/data/fallbacks/galera.json";
import match from "@/data/fallbacks/match.json";
import mentor from "@/data/fallbacks/mentor.json";
import missao from "@/data/fallbacks/missao.json";
import plano from "@/data/fallbacks/plano.json";

/**
 * Respostas offline das rotas de IA (data/fallbacks/*.json).
 * `getFallback(rota, chaves)` tenta as chaves em ordem e termina em "default".
 * Strings com `{variavel}` são preenchidas por `preencher()` com dados da requisição.
 */
const ARQUIVOS = { diagnostico, galera, match, mentor, missao, plano } as const;
export type RotaFallback = keyof typeof ARQUIVOS;

export function normalizarChave(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function temFallback(rota: RotaFallback, chave: string): boolean {
  return chave in (ARQUIVOS[rota] as Record<string, unknown>);
}

export function getFallback<T>(rota: RotaFallback, chaves: string[]): { chave: string; data: T } {
  const arq = ARQUIVOS[rota] as Record<string, unknown>;
  for (const chave of [...chaves, "default"]) {
    if (chave in arq) return { chave, data: structuredClone(arq[chave]) as T };
  }
  throw new Error(`fallback "${rota}" sem chave default`);
}

/** Substitui `{nome}` em todas as strings do objeto. Variáveis ausentes ficam como estão. */
export function preencher<T>(obj: T, vars: Record<string, string | number>): T {
  const sub = (s: string) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return sub(v);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    return v;
  };
  return walk(obj) as T;
}
