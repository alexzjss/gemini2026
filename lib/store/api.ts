"use client";
/* Cliente das rotas de IA: timeout, nunca lança, cai no fallback local e acende o badge "IA offline". */
import { useCallback } from "react";
import type { AiSource, ApiResponse } from "@/lib/types";
import { useAppStore } from "./AppStore";

const TIMEOUT_MS = 20_000;

export async function postApi<T>(path: string, body: unknown, fallback: () => T): Promise<ApiResponse<T>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as ApiResponse<T>;
    if (!json || typeof json !== "object" || !("data" in json)) throw new Error("resposta inválida");
    return json;
  } catch {
    return { data: fallback(), source: "fallback" };
  } finally {
    clearTimeout(t);
  }
}

/** `call(path, body, fallback)` + marca a origem da resposta na sessão. */
export function useApi() {
  const { dispatch } = useAppStore();
  return useCallback(
    async <T,>(path: string, body: unknown, fallback: () => T): Promise<ApiResponse<T>> => {
      const r = await postApi(path, body, fallback);
      dispatch({ type: "markSource", source: r.source as AiSource });
      return r;
    },
    [dispatch],
  );
}
