/* PROVISÓRIO (contrato 2 · dono: Agente 2). Regras de docs/07 §4 (anti-farm). */
import { LIMITES, PONTOS } from "@/lib/config";
import type { NivelId, PointEvent, PointEventType } from "@/lib/types";

export interface EventoPedido { type: PointEventType; ref?: string; at: string; }

const dia = (iso: string) => iso.slice(0, 10);

export function pontuar(e: EventoPedido): PointEvent {
  return { type: e.type, pontos: PONTOS[e.type], at: e.at, ref: e.ref };
}

/** Valida limites diários/únicos. `nivel` libera 3 mini-desafios/dia a partir do nível 3. */
export function podeGanhar(e: EventoPedido, historico: PointEvent[], ctx: { nivel?: NivelId } = {}): boolean {
  const mesmos = historico.filter((h) => h.type === e.type);
  switch (e.type) {
    case "galera_concluido":
      return mesmos.length === 0;
    case "desafio_semana":
    case "carreira_explorada":
    case "presenca_semana":
      return !mesmos.some((h) => h.ref === e.ref);
    case "missao_concluida":
    case "missao_aprovada":
      return !mesmos.some((h) => h.ref === e.ref && dia(h.at) === dia(e.at));
    case "habilidade_subiu": {
      const code = e.ref?.split(":")[0];
      if (mesmos.some((h) => h.ref === e.ref)) return false;
      return !mesmos.some((h) => h.ref?.split(":")[0] === code && dia(h.at) === dia(e.at));
    }
    case "mini_desafio_mentor": {
      if (mesmos.some((h) => h.ref === e.ref)) return false; // 1x por sessão
      const max = (ctx.nivel ?? 1) >= 3 ? LIMITES.miniDesafioPorDia.nivel3 : LIMITES.miniDesafioPorDia.base;
      return mesmos.filter((h) => dia(h.at) === dia(e.at)).length < max;
    }
  }
}

export function totalPontos(pontosSeed: number, eventos: PointEvent[]): number {
  return pontosSeed + eventos.reduce((s, e) => s + e.pontos, 0);
}
