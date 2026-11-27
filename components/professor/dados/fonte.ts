"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { LessonPlan, NivelId, SkillLevel } from "@/lib/types";
import type {
  AlunoTurma,
  AtencaoAluno,
  FichaAlunoView,
  InteresseTurma,
  LinhaHeatmap,
  TurmaView,
} from "../tipos";
import { ALUNOS, CARREIRAS, PROFESSOR, SKILLS, TURMAS, type AlunoDemo } from "./demo";

/**
 * ADAPTADOR DE DADOS DA UI DO PROFESSOR — único ponto de integração.
 *
 * Todas as telas de `components/professor` e `app/professor` leem e escrevem
 * só por estes hooks. Hoje eles usam os dados de `demo.ts` e guardam planos e
 * conversas em `localStorage` próprio, para a UI funcionar sozinha.
 *
 * Integração (quando os Agentes 1 e 2 entregarem):
 *  - useTurmaView    → montar a partir de `useClassView(classId)` (selectors)
 *  - useFichaAluno   → `useStudentView(studentId)` + sinais de `domain/evasao`
 *  - usePlanos/usePlano → `state.planos` do AppStore
 *  - useAcoesProfessor  → ações `savePlan`, `approvePlan`, `markConversation`
 *  - as regras locais abaixo (nível, sinais, agregados) saem e passam a vir de
 *    `lib/domain` (nivelPorPontos, sinais/status, heatmap/topInteresses).
 * As telas não mudam: elas só conhecem os tipos de `../tipos.ts`.
 */

/* ======================= regras (espelho de docs/07) ======================= */

const LIMITES_NIVEL: [NivelId, number][] = [
  [5, 2500],
  [4, 1500],
  [3, 700],
  [2, 300],
  [1, 0],
];
export function nivelPorPontos(pontos: number): NivelId {
  return (LIMITES_NIVEL.find(([, min]) => pontos >= min) ?? [1, 0])[0];
}

const media = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

/** docs/07 §7. Sem número de "risco": só os motivos, em texto. */
function sinais(a: AlunoDemo): string[] {
  const motivos: string[] = [];
  const ult4 = media(a.frequencia.slice(-4));
  if (ult4 < 75) motivos.push(`Frequência de ${Math.round(ult4)}% nas últimas 4 semanas`);
  const ult2 = media(a.frequencia.slice(-2));
  const ant6 = media(a.frequencia.slice(-8, -2));
  if (ult2 <= ant6 - 15) motivos.push(`Frequência caiu ${Math.round(ant6 - ult2)} pontos nas últimas 2 semanas`);
  if (a.ultimoAcessoDiasAtras >= 14) motivos.push(`Sem entrar na plataforma há ${a.ultimoAcessoDiasAtras} dias`);
  const caindo = Object.values(a.skills).filter((s) => s.tendencia === "caindo").length;
  if (caindo >= 2) motivos.push(`Queda em ${caindo} habilidades do 1º para o 2º bimestre`);
  return motivos;
}

function atencao(a: AlunoDemo, alerta?: AlertaLocal): AtencaoAluno {
  const motivos = sinais(a);
  if (motivos.length === 0) return { status: "ok", motivos, conversa: alerta };
  // "Conversei" vale até surgir um sinal novo.
  const sinalNovo = alerta ? motivos.some((m) => !alerta.motivos.includes(m)) : true;
  return {
    status: alerta && !sinalNovo ? "acompanhando" : "atencao",
    motivos,
    conversa: alerta ? { conversouEm: alerta.conversouEm, nota: alerta.nota } : undefined,
  };
}

function paraAlunoTurma(a: AlunoDemo, alertas: Record<string, AlertaLocal>): AlunoTurma {
  const skills: Record<string, SkillLevel | undefined> = {};
  for (const [code, s] of Object.entries(a.skills)) skills[code] = s.level;
  return {
    id: a.id,
    nome: a.nome,
    inicial: a.inicial,
    nivel: nivelPorPontos(a.pontos),
    pontos: a.pontos,
    skills,
    atencao: atencao(a, alertas[a.id]),
    galeraConcluido: a.galeraConcluido,
  };
}

function linhasHeatmap(alunos: AlunoTurma[]): LinhaHeatmap[] {
  return SKILLS.map((skill) => {
    const dist = { defasagem: 0, em_desenvolvimento: 0, dominada: 0 };
    for (const a of alunos) {
      const lv = a.skills[skill.code];
      if (lv) dist[lv]++;
    }
    const nComDado = dist.defasagem + dist.em_desenvolvimento + dist.dominada;
    return {
      skill,
      nComDado,
      distribuicao: dist,
      pctDefasagem: nComDado ? Math.round((dist.defasagem / nComDado) * 100) : 0,
    };
  }).sort((x, y) => y.pctDefasagem - x.pctDefasagem || y.nComDado - x.nComDado);
}

function topInteresses(alunos: AlunoDemo[]): InteresseTurma[] {
  const peso: Record<string, number> = {};
  const somar = (ids: string[], p: number) => {
    for (const id of ids) for (const tag of CARREIRAS[id]?.tags ?? []) peso[tag] = (peso[tag] ?? 0) + p;
  };
  for (const a of alunos) {
    somar(a.queroConhecer, 3);
    somar(a.salvas, 2);
    somar(a.top4, 1);
  }
  return Object.entries(peso)
    .map(([tag, p]) => ({ tag, peso: p }))
    .sort((x, y) => y.peso - x.peso || x.tag.localeCompare(y.tag))
    .slice(0, 5);
}

/* ======================= estado local (demo) ======================= */

interface AlertaLocal {
  conversouEm: string;
  nota: string;
  /** Motivos vistos na conversa; um motivo fora desta lista reabre o alerta. */
  motivos: string[];
}

interface EstadoProfessor {
  planos: LessonPlan[];
  alertas: Record<string, AlertaLocal>;
}

const CHAVE = "gemini2026:professor-demo";
const VAZIO: EstadoProfessor = { planos: [], alertas: {} };
let estado: EstadoProfessor = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (bruto) estado = { ...VAZIO, ...(JSON.parse(bruto) as EstadoProfessor) };
  } catch {
    /* sem localStorage: segue em memória */
  }
}

function gravar(proximo: EstadoProfessor) {
  estado = proximo;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* sem localStorage: segue em memória */
  }
  ouvintes.forEach((f) => f());
}

function assinar(f: () => void) {
  carregar();
  ouvintes.add(f);
  const aoMudarStorage = (e: StorageEvent) => {
    if (e.key !== CHAVE) return;
    carregado = false;
    carregar();
    f();
  };
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

function useEstado(): EstadoProfessor {
  return useSyncExternalStore(
    assinar,
    () => {
      carregar();
      return estado;
    },
    () => VAZIO,
  );
}

/* ======================= hooks públicos ======================= */

/** false no SSR e no 1º render do cliente: as telas mostram skeleton. */
export function useHidratado() {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok;
}

/** Guarda do TeacherShell. Na integração: `state.sessao?.role === "professor"`. */
export function useSessaoProfessor() {
  return { ok: true, professor: PROFESSOR };
}

export function useTurmas() {
  return TURMAS;
}

export function useTurmaView(classId: string): TurmaView | null {
  const { alertas } = useEstado();
  return useMemo(() => {
    const turma = TURMAS.find((t) => t.id === classId);
    if (!turma) return null;
    const demo = ALUNOS.filter((a) => a.classId === turma.id);
    const alunos = demo
      .map((a) => paraAlunoTurma(a, alertas))
      .sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR"));
    const linhas = linhasHeatmap(alunos);
    return {
      turma,
      turmas: TURMAS,
      professor: PROFESSOR,
      alunos,
      linhas,
      topInteresses: topInteresses(demo),
      resumo: {
        maiorDefasagem: linhas[0]?.nComDado ? linhas[0] : undefined,
        nAtencao: alunos.filter((a) => a.atencao.status === "atencao").length,
        pctGalera: alunos.length
          ? Math.round((alunos.filter((a) => a.galeraConcluido).length / alunos.length) * 100)
          : 0,
      },
      // Matches só existem depois do Match Day (vêm do store na integração).
      matches: [],
    };
  }, [classId, alertas]);
}

export function useFichaAluno(studentId: string): FichaAlunoView | null {
  const { alertas } = useEstado();
  return useMemo(() => {
    const a = ALUNOS.find((x) => x.id === studentId);
    const turma = a && TURMAS.find((t) => t.id === a.classId);
    if (!a || !turma) return null;
    return {
      aluno: paraAlunoTurma(a, alertas),
      turma,
      serie: a.serie,
      frequenciaMedia: Math.round(media(a.frequencia)),
      skills: SKILLS.filter((s) => a.skills[s.code]).map((skill) => {
        const s = a.skills[skill.code];
        const progresso =
          s.level === "dominada" ? 100 : s.level === "em_desenvolvimento" ? Math.round(50 + (s.media - 5) * 12) : Math.min(45, Math.round(s.media * 10));
        return { skill, code: skill.code, level: s.level, media: s.media, tendencia: s.tendencia, progresso };
      }),
      perfil: a.perfil,
      carreiras: [
        ...a.queroConhecer.map((id) => ({ nome: CARREIRAS[id]?.nome ?? id, tipo: "quero_conhecer" as const })),
        ...a.salvas
          .filter((id) => !a.queroConhecer.includes(id))
          .map((id) => ({ nome: CARREIRAS[id]?.nome ?? id, tipo: "salva" as const })),
      ],
      match: undefined,
      missoes: [...a.missoes].sort((x, y) => y.at.localeCompare(x.at)),
    };
  }, [studentId, alertas]);
}

export function usePlanos(): LessonPlan[] {
  return useEstado().planos;
}

export function usePlano(planId: string): LessonPlan | undefined {
  return useEstado().planos.find((p) => p.id === planId);
}

export function useAcoesProfessor() {
  const salvarPlano = useCallback((plano: LessonPlan) => {
    const outros = estado.planos.filter((p) => p.id !== plano.id);
    gravar({ ...estado, planos: [plano, ...outros] });
  }, []);

  const aprovarPlano = useCallback((planId: string) => {
    gravar({
      ...estado,
      planos: estado.planos.map((p) =>
        p.id === planId ? { ...p, status: "aprovado", aprovadoEm: new Date().toISOString() } : p,
      ),
    });
  }, []);

  const reabrirPlano = useCallback((planId: string) => {
    gravar({
      ...estado,
      planos: estado.planos.map((p) => (p.id === planId ? { ...p, status: "rascunho", aprovadoEm: undefined } : p)),
    });
  }, []);

  const registrarConversa = useCallback((studentId: string, nota: string) => {
    const a = ALUNOS.find((x) => x.id === studentId);
    gravar({
      ...estado,
      alertas: {
        ...estado.alertas,
        [studentId]: { conversouEm: new Date().toISOString(), nota: nota.slice(0, 280), motivos: a ? sinais(a) : [] },
      },
    });
  }, []);

  return { salvarPlano, aprovarPlano, reabrirPlano, registrarConversa };
}
