// docs/07 §9 — agregados da turma (painel do professor)
import type { Career, SkillLevel, SkillStatus, Student } from "../types";
import type { StatusAtencao } from "./evasao";

export interface AlunoTurma {
  student: Student;
  skills: SkillStatus[];
  queroConhecer: string[];
  salvas: string[];
  top4: string[];
  galeraConcluido: boolean;
  status: StatusAtencao;
  match?: { mentorId: string; area: string };
}

export interface DefasagemSkill { code: string; pct: number; defasagem: number; total: number }

export function defasagemPorSkill(alunos: AlunoTurma[]): DefasagemSkill[] {
  const map = new Map<string, { d: number; t: number }>();
  for (const a of alunos)
    for (const s of a.skills) {
      const e = map.get(s.code) ?? { d: 0, t: 0 };
      e.t++;
      if (s.level === "defasagem") e.d++;
      map.set(s.code, e);
    }
  return [...map]
    .map(([code, { d, t }]) => ({ code, defasagem: d, total: t, pct: Math.round((100 * d) / t) }))
    .sort((a, b) => b.pct - a.pct || a.code.localeCompare(b.code));
}

export interface Heatmap {
  colunas: { studentId: string; nome: string }[];
  linhas: { code: string; pct: number; celulas: { studentId: string; level: SkillLevel | null }[] }[];
}

export function heatmap(alunos: AlunoTurma[]): Heatmap {
  const ordenados = [...alunos].sort((a, b) => a.student.nome.localeCompare(b.student.nome, "pt-BR"));
  return {
    colunas: ordenados.map((a) => ({ studentId: a.student.id, nome: a.student.nome })),
    linhas: defasagemPorSkill(alunos).map(({ code, pct }) => ({
      code,
      pct,
      celulas: ordenados.map((a) => ({
        studentId: a.student.id,
        level: a.skills.find((s) => s.code === code)?.level ?? null,
      })),
    })),
  };
}

/** Quero conhecer (3) + salvas (2) + top 4 (1), somando career.tags. */
export function topInteresses(alunos: AlunoTurma[], careers: Career[], n = 5): { tag: string; peso: number }[] {
  const peso = new Map<string, number>();
  const add = (ids: string[], p: number) => {
    for (const id of ids)
      for (const tag of careers.find((c) => c.id === id)?.tags ?? []) peso.set(tag, (peso.get(tag) ?? 0) + p);
  };
  for (const a of alunos) {
    add(a.queroConhecer, 3);
    add(a.salvas, 2);
    add(a.top4, 1);
  }
  return [...peso]
    .map(([tag, p]) => ({ tag, peso: p }))
    .sort((a, b) => b.peso - a.peso || a.tag.localeCompare(b.tag))
    .slice(0, n);
}

export function resumo(alunos: AlunoTurma[], careers: Career[]) {
  const d = defasagemPorSkill(alunos)[0];
  return {
    maiorDefasagem: d ? { code: d.code, pct: d.pct } : undefined,
    topInteresses: topInteresses(alunos, careers, 3).map((t) => t.tag),
    atencao: alunos.filter((a) => a.status === "atencao").length,
    pctGalera: alunos.length ? Math.round((100 * alunos.filter((a) => a.galeraConcluido).length) / alunos.length) : 0,
  };
}

export function matches(alunos: AlunoTurma[]) {
  return alunos
    .filter((a) => a.match)
    .map((a) => ({ studentId: a.student.id, nome: a.student.nome, mentorId: a.match!.mentorId, area: a.match!.area }));
}
