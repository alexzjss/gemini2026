/* PROVISÓRIO (contrato 2 · dono: Agente 2). Regras de docs/07 §5. */
import { NIVEIS, type NivelDef } from "@/lib/config";
import type { NivelId } from "@/lib/types";

export function nivelPorPontos(pontos: number): NivelId {
  let n: NivelId = 1;
  for (const d of NIVEIS) if (pontos >= d.min) n = d.id;
  return n;
}

export function nivelDef(n: NivelId): NivelDef {
  return NIVEIS[n - 1];
}

export function proximoNivel(pontos: number): NivelDef | null {
  const n = nivelPorPontos(pontos);
  return n < 5 ? NIVEIS[n] : null;
}

export function faltam(pontos: number): number {
  const p = proximoNivel(pontos);
  return p ? Math.max(0, p.min - pontos) : 0;
}

/** 0–1: (pontos − limiteAtual) / (proximoLimite − limiteAtual). */
export function progressoNivel(pontos: number): number {
  const atual = nivelDef(nivelPorPontos(pontos));
  const prox = proximoNivel(pontos);
  if (!prox) return 1;
  return Math.min(1, Math.max(0, (pontos - atual.min) / (prox.min - atual.min)));
}

export function abreNoNivel(n: NivelId): string {
  return nivelDef(n).abre;
}
