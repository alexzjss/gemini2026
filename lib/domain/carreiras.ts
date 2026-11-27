// docs/07 §3 — ranking de carreiras. Nota NUNCA esconde, filtra nem reordena carreiras.
import type { AffinityAxis, AffinityProfile, Career, SkillStatus, StudentLocal } from "../types";
import { LIMITES } from "../config";
import { labelEixo } from "./afinidades";
import { AXES, cosseno } from "./util";

type Swipe = StudentLocal["swipe"];
export interface CarreiraRank { career: Career; similaridade: number; score: number; passada: boolean }

const swipeVazio: Swipe = { salvas: [], queroConhecer: [], passadas: [] };

export function rankCarreiras(p: AffinityProfile, careers: Career[], swipe: Swipe = swipeVazio): CarreiraRank[] {
  const ranked = careers.map((career, i) => {
    const similaridade = cosseno(p, career.affinity);
    const bonus =
      (swipe.salvas.includes(career.id) ? LIMITES.bonusSalva : 0) +
      (swipe.queroConhecer.includes(career.id) ? LIMITES.bonusQueroConhecer : 0);
    return { career, similaridade, score: similaridade + bonus, passada: swipe.passadas.includes(career.id), i };
  });
  ranked.sort((a, b) => Number(a.passada) - Number(b.passada) || b.score - a.score || a.i - b.i);
  return ranked.map(({ i: _i, ...r }) => r);
}

/** Top 4 por similaridade pura ("Caminhos que combinam"). */
export function caminhos(p: AffinityProfile, careers: Career[], n: number = LIMITES.topCaminhos): Career[] {
  return rankCarreiras(p, careers).slice(0, n).map((r) => r.career);
}

/** Fila do swipe: todas as carreiras, passadas no fim (nunca somem). */
export function filaSwipe(p: AffinityProfile, careers: Career[], swipe: Swipe = swipeVazio): Career[] {
  return rankCarreiras(p, careers, swipe).map((r) => r.career);
}

/** Texto "combina:" — rótulos curtos dos 2 eixos com maior perfil × afinidade da carreira. */
export function combina(p: AffinityProfile, career: Career): string[] {
  return [...AXES]
    .map((eixo, i) => ({ eixo, v: p[eixo] * career.affinity[eixo], i }))
    .sort((a, b) => b.v - a.v || a.i - b.i)
    .slice(0, 2)
    .map(({ eixo }) => career.combinaCom[eixo as AffinityAxis] ?? labelEixo(eixo).toLowerCase());
}

export interface OndeAEscola { code: string; frase?: string; status?: SkillStatus }

/** 1ª habilidade da carreira que o aluno não domina (todas dominadas → a 1ª). */
export function ondeAEscolaAparece(career: Career, skills: SkillStatus[]): OndeAEscola | undefined {
  const st = (code: string) => skills.find((s) => s.code === code);
  const code = career.skills.find((c) => st(c)?.level !== "dominada") ?? career.skills[0];
  if (!code) return undefined;
  return { code, frase: career.escola[code], status: st(code) };
}
