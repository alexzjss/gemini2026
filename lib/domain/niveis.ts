// docs/07 §5 — níveis por pontos de esforço
import type { NivelId } from "../types";
import { NIVEIS } from "../config";

export function nivelPorPontos(pontos: number): NivelId {
  let n: NivelId = 1;
  for (const l of NIVEIS) if (pontos >= l.min) n = l.id;
  return n;
}

export const infoNivel = (n: NivelId) => NIVEIS.find((l) => l.id === n)!;

/** Pontos até o próximo nível (0 no nível máximo). */
export function faltam(pontos: number): number {
  const prox = NIVEIS.find((l) => l.min > pontos);
  return prox ? prox.min - pontos : 0;
}

/** Barra 0–1 dentro do nível atual + rótulo "1.240 / 1.500". */
export function progressoNivel(pontos: number): { fracao: number; rotulo: string; proximoLimite?: number } {
  const atual = infoNivel(nivelPorPontos(pontos));
  const prox = NIVEIS.find((l) => l.min > pontos);
  const fmt = (x: number) => x.toLocaleString("pt-BR");
  if (!prox) return { fracao: 1, rotulo: fmt(pontos) };
  return {
    fracao: (pontos - atual.min) / (prox.min - atual.min),
    rotulo: `${fmt(pontos)} / ${fmt(prox.min)}`,
    proximoLimite: prox.min,
  };
}

export function abreNoNivel(n: NivelId): string {
  return infoNivel(n).abre;
}

/** "Faltam 260 pontos pro nível 4, que abre os mentores de alta demanda." */
export function textoFaltam(pontos: number): string | undefined {
  const n = nivelPorPontos(pontos);
  if (n === 5) return undefined;
  const prox = (n + 1) as NivelId;
  return `Faltam ${faltam(pontos).toLocaleString("pt-BR")} pontos pro nível ${prox}, que abre ${abreNoNivel(prox)}.`;
}
