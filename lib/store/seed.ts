/* Seed tipado (import estático). Os JSONs são do Agente 2 (F3); este arquivo é do Agente 1. */
import type {
  Career, ClassGroup, FraseTitulo, Mentor, MissionDef, ReportCard, Scenario, School, Skill, Student, Teacher,
} from "@/lib/types";
import schoolJson from "@/data/seed/school.json";
import classesJson from "@/data/seed/classes.json";
import teacherJson from "@/data/seed/teacher.json";
import skillsJson from "@/data/seed/skills.json";
import scenariosJson from "@/data/seed/scenarios.json";
import frasesJson from "@/data/seed/frases.json";
import careersJson from "@/data/seed/careers.json";
import mentorsJson from "@/data/seed/mentors.json";
import missoesJson from "@/data/seed/missoes.json";
import studentsJson from "@/data/seed/students.json";
import reportCardsJson from "@/data/seed/report-cards.json";

export const school = schoolJson as unknown as School;
export const classes = classesJson as unknown as ClassGroup[];
export const teacher = teacherJson as unknown as Teacher;
export const skills = skillsJson as unknown as Skill[];
export const scenarios = scenariosJson as unknown as Scenario[];
export const frases = frasesJson as unknown as FraseTitulo[];
export const careers = careersJson as unknown as Career[];
export const mentors = mentorsJson as unknown as Mentor[];
export const missoes = missoesJson as unknown as MissionDef[];
export const students = studentsJson as unknown as Student[];
export const reportCards = reportCardsJson as unknown as ReportCard[];

export const seed = { school, classes, teacher, skills, scenarios, frases, careers, mentors, missoes, students, reportCards };

const byId = <T, K extends keyof T>(xs: T[], k: K) => new Map(xs.map((x) => [x[k] as unknown as string, x]));
const studentsById = byId(students, "id");
const studentsByMatricula = byId(students, "matricula");
const careersById = byId(careers, "id");
const mentorsById = byId(mentors, "id");
const skillsByCode = byId(skills, "code");
const reportByStudent = byId(reportCards, "studentId");
const missoesByCode = byId(missoes, "skillCode");

export const getStudent = (id: string) => studentsById.get(id);
export const getStudentByMatricula = (m: string) => studentsByMatricula.get(m.trim());
export const getCareer = (id: string) => careersById.get(id);
export const getMentor = (id: string) => mentorsById.get(id);
export const getSkill = (code: string) => skillsByCode.get(code);
export const getReportCard = (studentId: string) => reportByStudent.get(studentId);
export const getMission = (code: string) => missoesByCode.get(code);
export const getClass = (id: string) => classes.find((c) => c.id === id);
export const scenariosGalera = () => scenarios.filter((s) => s.grupo === "galera");
export const scenariosSemana = () => scenarios.filter((s) => s.grupo === "semana");
