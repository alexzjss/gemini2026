import type { AffinityAxis, AffinityProfile } from "../types";
import { EIXOS } from "../config";

export const AXES: AffinityAxis[] = EIXOS.map((e) => e.id);

export const media = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export const round1 = (x: number): number => Math.round(x * 10) / 10;

export const clamp = (x: number, min: number, max: number): number => Math.min(max, Math.max(min, x));

export function cosseno(a: AffinityProfile, b: AffinityProfile): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const k of AXES) {
    dot += a[k] * b[k];
    na += a[k] * a[k];
    nb += b[k] * b[k];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** "2026-11-27T10:00:00Z" → "2026-11-27" */
export const dia = (iso: string): string => iso.slice(0, 10);

export function diasEntre(deIso: string, ateIso: string): number {
  const ms = Date.parse(dia(ateIso)) - Date.parse(dia(deIso));
  return Math.round(ms / 86_400_000);
}

/** Semana ISO no formato "2026-W48". */
export function semanaIso(iso: string): string {
  const d = new Date(dia(iso) + "T00:00:00Z");
  const wd = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - wd);
  const ano = d.getUTCFullYear();
  const semana = Math.ceil(((d.getTime() - Date.UTC(ano, 0, 1)) / 86_400_000 + 1) / 7);
  return `${ano}-W${String(semana).padStart(2, "0")}`;
}

export function perfilVazio(): AffinityProfile {
  return { analisar: 0, tech: 0, criar: 0, cuidar: 0, negocios: 0, esportes: 0 };
}
