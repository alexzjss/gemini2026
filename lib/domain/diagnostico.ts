/* PROVISÓRIO (contrato 2 · dono: Agente 2). Regras de docs/07 §1. */
import { LIMIARES } from "@/lib/config";
import type { ReportCard, SkillLevel, SkillStatus } from "@/lib/types";

const L = LIMIARES.diagnostico;
const ORDEM: SkillLevel[] = ["defasagem", "em_desenvolvimento", "dominada"];

export function nivelPorMedia(media: number): SkillLevel {
  if (media >= L.dominada) return "dominada";
  if (media >= L.emDesenvolvimento) return "em_desenvolvimento";
  return "defasagem";
}

export function proximoNivelHabilidade(l: SkillLevel): SkillLevel {
  return ORDEM[Math.min(ORDEM.length - 1, ORDEM.indexOf(l) + 1)];
}

const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export function tendencia(b1: number[], b2: number[]): SkillStatus["tendencia"] {
  if (!b1.length || !b2.length) return "estavel";
  const d = media(b2) - media(b1);
  if (d > L.tendencia) return "subindo";
  if (d < -L.tendencia) return "caindo";
  return "estavel";
}

export function progresso(level: SkillLevel, m: number, aprovadas = 0): number {
  if (level === "dominada") return 100;
  const base = level === "defasagem" ? Math.min(L.progressoMaxDefasagem, m * 10) : 50 + (m - 5) * 12;
  return Math.round(Math.min(L.progressoMaxAntesDeSubir, Math.max(0, base) + aprovadas * L.bonusMissao));
}

export function skillStatuses(
  rc: ReportCard | undefined,
  overrides: Record<string, { level: SkillLevel; at: string }> = {},
): SkillStatus[] {
  const porSkill = new Map<string, { b1: number[]; b2: number[] }>();
  for (const a of rc?.avaliacoes ?? []) {
    for (const code of a.skillCodes) {
      const e = porSkill.get(code) ?? { b1: [], b2: [] };
      (a.bimestre === 1 ? e.b1 : e.b2).push(a.nota);
      porSkill.set(code, e);
    }
  }
  return [...porSkill.entries()].map(([code, { b1, b2 }]) => {
    const m = Math.round(media([...b1, ...b2]) * 10) / 10;
    const ov = overrides[code];
    const level = ov?.level ?? nivelPorMedia(m);
    return { code, level, media: m, tendencia: tendencia(b1, b2), progresso: progresso(level, m), subiuEm: ov?.at };
  });
}
