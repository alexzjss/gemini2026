/* Persistência do LocalState em localStorage (chave gemini2026:v1).
 * Funciona em memória se o storage estiver indisponível. */
import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/config";
import type { LocalState, StudentLocal } from "@/lib/types";

export const initialState = (): LocalState => ({
  version: STORAGE_VERSION,
  porAluno: {},
  planos: [],
  alertas: {},
  semestreSimulado: false,
});

export const emptyStudentLocal = (): StudentLocal => ({
  galera: { respostas: {} },
  semana: { respostas: {} },
  swipe: { salvas: [], queroConhecer: [], passadas: [] },
  preferenciasMentor: [],
  eventos: [],
  skillOverrides: {},
  missoes: [],
  chats: {},
  iaCache: {},
});

/** Migração por `version`. Hoje só existe a v1; versões desconhecidas reiniciam. */
export function migrate(raw: unknown): LocalState {
  if (!raw || typeof raw !== "object") return initialState();
  const s = raw as Partial<LocalState>;
  if (s.version !== STORAGE_VERSION) return initialState();
  const base = initialState();
  const porAluno: LocalState["porAluno"] = {};
  for (const [id, v] of Object.entries(s.porAluno ?? {})) porAluno[id] = { ...emptyStudentLocal(), ...v };
  return { ...base, ...s, porAluno, version: STORAGE_VERSION };
}

export function load(): LocalState {
  try {
    if (typeof window === "undefined") return initialState();
    const txt = window.localStorage.getItem(STORAGE_KEY);
    return txt ? migrate(JSON.parse(txt)) : initialState();
  } catch {
    return initialState();
  }
}

export function save(state: LocalState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage cheio/bloqueado: segue em memória */
  }
}

export function reset(): LocalState {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return initialState();
}
