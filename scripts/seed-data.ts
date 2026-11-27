// Carrega o seed do disco (scripts e testes). No app, o Agente 1 importa os JSON em lib/store/seed.ts.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { SeedData } from "../lib/store/selectors";

const DIR = fileURLToPath(new URL("../data/seed/", import.meta.url));
const ler = <T,>(nome: string, padrao?: T): T => {
  const p = DIR + nome;
  if (!existsSync(p) && padrao !== undefined) return padrao;
  return JSON.parse(readFileSync(p, "utf8")) as T;
};

export function carregarSeed(gerados?: Pick<SeedData, "students" | "reportCards">): SeedData {
  return {
    school: ler("school.json"),
    classes: ler("classes.json"),
    teacher: ler("teacher.json"),
    skills: ler("skills.json"),
    scenarios: ler("scenarios.json"),
    frases: ler("frases.json"),
    careers: ler("careers.json"),
    mentors: ler("mentors.json"),
    missoes: ler("missoes.json"),
    students: gerados?.students ?? ler("students.json"),
    reportCards: gerados?.reportCards ?? ler("report-cards.json"),
  };
}

export const SEED_DIR = DIR;
