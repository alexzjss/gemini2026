// docs/07 §4 — pontos de esforço. Nota alta vale +0 (não existe evento para nota).
import type { NivelId, PointEvent, PointEventType } from "../types";
import { LIMITES, PONTOS } from "../config";
import { dia, semanaIso } from "./util";

/** Evento candidato. `ref` identifica o alvo: careerId, skillCode, "semana-9", id da sessão do mentor,
 *  e em `habilidade_subiu` a transição ("EM13MAT316:em_desenvolvimento>dominada"). */
export interface EventoCandidato { type: PointEventType; at: string; ref?: string }

export const pontuar = (type: PointEventType): number => PONTOS[type];

export function podeGanhar(e: EventoCandidato, historico: PointEvent[], ctx: { nivel?: NivelId } = {}): boolean {
  const mesmoTipo = historico.filter((h) => h.type === e.type);
  const mesmoRef = mesmoTipo.filter((h) => h.ref === e.ref);
  switch (e.type) {
    case "galera_concluido":
      return mesmoTipo.length === 0;
    case "desafio_semana":
      return !mesmoTipo.some((h) => semanaIso(h.at) === semanaIso(e.at));
    case "carreira_explorada":
    case "habilidade_subiu":
    case "presenca_semana":
      return Boolean(e.ref) && mesmoRef.length === 0;
    case "missao_concluida":
    case "missao_aprovada":
      return Boolean(e.ref) && !mesmoRef.some((h) => dia(h.at) === dia(e.at));
    case "mini_desafio_mentor": {
      const limite = (ctx.nivel ?? 1) >= 3 ? LIMITES.miniDesafiosPorDia.aPartirDoNivel3 : LIMITES.miniDesafiosPorDia.base;
      const hoje = mesmoTipo.filter((h) => dia(h.at) === dia(e.at)).length;
      return Boolean(e.ref) && mesmoRef.length === 0 && hoje < limite;
    }
  }
}

/** Valida e devolve o evento pontuado, ou null se o limite já foi atingido (anti-farm). */
export function registrar(e: EventoCandidato, historico: PointEvent[], ctx: { nivel?: NivelId } = {}): PointEvent | null {
  if (!podeGanhar(e, historico, ctx)) return null;
  return { type: e.type, pontos: pontuar(e.type), at: e.at, ...(e.ref ? { ref: e.ref } : {}) };
}

export function totalPontos(pontosSeed: number, eventos: PointEvent[]): number {
  return pontosSeed + eventos.reduce((s, e) => s + e.pontos, 0);
}
