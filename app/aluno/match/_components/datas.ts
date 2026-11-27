import { SEMESTRE } from "@/lib/config";

const fmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "America/Sao_Paulo" });

export const dataMatchDay = () => fmt.format(new Date(`${SEMESTRE.fim}T12:00:00-03:00`)).replace(".", "");

export function diasParaMatchDay(hoje = new Date()): number {
  const fim = new Date(`${SEMESTRE.fim}T00:00:00-03:00`).getTime();
  return Math.max(0, Math.ceil((fim - hoje.getTime()) / 86_400_000));
}

export function matchDayChegou(semestreSimulado: boolean, hoje = new Date()): boolean {
  return semestreSimulado || diasParaMatchDay(hoje) === 0;
}
