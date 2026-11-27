import careersJson from "@/data/seed/careers.json";
import mentorsJson from "@/data/seed/mentors.json";
import skillsJson from "@/data/seed/skills.json";
import studentsJson from "@/data/seed/students.json";
import type { Career, Mentor, Skill, Student } from "@/lib/types";

/**
 * Leitura do seed no servidor (rotas de IA). Os JSONs são do Agente 2 (data/seed/);
 * aqui só há acesso tipado e buscas por id.
 */
export const careers = careersJson as unknown as Career[];
export const mentors = mentorsJson as unknown as Mentor[];
export const skills = skillsJson as unknown as Skill[];
const students = studentsJson as unknown as Student[];

/** Nomes e primeiros nomes dos alunos fictícios: removidos de textos livres antes de ir ao Gemini. */
export const nomesAlunos: string[] = students.flatMap((s) => [s.nome, s.nome.split(/\s+/)[0]]).filter(Boolean);

export const careerById = (id: string) => careers.find((c) => c.id === id);
export const mentorById = (id: string) => mentors.find((m) => m.id === id);
export const skillByCode = (code: string) => skills.find((s) => s.code === code);

/** "Estatística: média, moda…" ou o próprio código se a habilidade não estiver no seed. */
export const descricaoSkill = (code: string) => skillByCode(code)?.descricaoJovem ?? code;
