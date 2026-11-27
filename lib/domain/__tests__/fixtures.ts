import { carregarSeed } from "../../../scripts/seed-data";
import type { StudentSnapshot } from "../../types";

export const seed = carregarSeed();

export function snapshot(over: Partial<StudentSnapshot> = {}): StudentSnapshot {
  return {
    studentId: "x",
    serie: 2,
    nivel: 1,
    perfil: { analisar: 50, tech: 50, criar: 50, cuidar: 50, negocios: 50, esportes: 50 },
    top4: [],
    salvas: [],
    queroConhecer: [],
    preferenciasMentor: [],
    skills: [],
    evolucoes: 0,
    missoes: 1,
    frequenciaMedia: 90,
    galeraConcluido: true,
    ...over,
  };
}
