// docs/07 §1 — boletim → SkillStatus
import type { ReportCard, SkillLevel, SkillStatus, StudentLocal } from "../types";
import { LIMIARES } from "../config";
import { clamp, diasEntre, media, round1 } from "./util";

const ORDEM: SkillLevel[] = ["defasagem", "em_desenvolvimento", "dominada"];

export function nivelPorMedia(m: number): SkillLevel {
  if (m >= LIMIARES.diagnostico.dominada) return "dominada";
  if (m >= LIMIARES.diagnostico.emDesenvolvimento) return "em_desenvolvimento";
  return "defasagem";
}

export function tendencia(bim1: number[], bim2: number[]): SkillStatus["tendencia"] {
  if (!bim1.length || !bim2.length) return "estavel";
  const d = media(bim2) - media(bim1);
  const t = LIMIARES.diagnostico.tendencia;
  if (d > t) return "subindo";
  if (d < -t) return "caindo";
  return "estavel";
}

/** Barra da ficha (0–100). `aprovadasExtras` = missões aprovadas que ainda não subiram o nível. */
export function progresso(level: SkillLevel, m: number, aprovadasExtras = 0): number {
  if (level === "dominada") return 100;
  const base = level === "defasagem" ? Math.min(45, m * 10) : clamp(50 + (m - 5) * 12, 50, 95);
  return Math.round(Math.min(95, base + 15 * aprovadasExtras));
}

export function proximoNivel(level: SkillLevel): SkillLevel {
  return ORDEM[Math.min(ORDEM.length - 1, ORDEM.indexOf(level) + 1)];
}

export function skillStatuses(
  reportCard: ReportCard | undefined,
  overrides: StudentLocal["skillOverrides"] = {},
): SkillStatus[] {
  const porCode = new Map<string, { b1: number[]; b2: number[] }>();
  for (const a of reportCard?.avaliacoes ?? []) {
    for (const code of a.skillCodes) {
      const e = porCode.get(code) ?? { b1: [], b2: [] };
      (a.bimestre === 1 ? e.b1 : e.b2).push(a.nota);
      porCode.set(code, e);
    }
  }
  const out: SkillStatus[] = [];
  for (const [code, { b1, b2 }] of porCode) {
    const m = round1(media([...b1, ...b2]));
    const ov = overrides[code];
    const level = ov?.level ?? nivelPorMedia(m);
    out.push({
      code,
      level,
      media: m,
      tendencia: tendencia(b1, b2),
      progresso: progresso(level, m),
      ...(ov ? { subiuEm: ov.at } : {}),
    });
  }
  return out;
}

/** Rótulo da barra da ficha. */
export function rotuloProgresso(s: SkillStatus, agoraIso: string): string {
  if (s.subiuEm && diasEntre(s.subiuEm, agoraIso) <= 7) return "subiu esta semana";
  if (s.level === "dominada") return "você já manda bem";
  if (s.progresso < 30) return "começando";
  return "em desenvolvimento";
}
