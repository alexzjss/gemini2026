"use client";
/* Store global: Context + reducer + persistência (docs/04 §Estado no cliente).
 * Dono: Agente 1. Toda ação que gera pontos passa por domain/pontos (anti-farm). */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type {
  AiSource, ChatTurn, LessonPlan, LocalState, MatchResult, PointEvent, PointEventType, StudentLocal,
} from "@/lib/types";
import { LIMITES } from "@/lib/config";
import { emptyStudentLocal, initialState, load, reset as resetStorage, save } from "./local";
import { getReportCard, getStudent } from "./seed";
import { podeGanhar, pontuar, totalPontos, type EventoPedido } from "@/lib/domain/pontos";
import { nivelPorPontos } from "@/lib/domain/niveis";
import { proximoNivelHabilidade, skillStatuses } from "@/lib/domain/diagnostico";
import { simularSemestre } from "@/lib/domain/match";
import { STORAGE_KEY } from "@/lib/config";

/* ---------- Tipos de UI (não persistidos) ---------- */
export interface Toast { id: number; texto: string; pontos?: number; }
interface UiState { hydrated: boolean; aiOffline: boolean; toasts: Toast[]; }
export interface StoreState { local: LocalState; ui: UiState; }

type SwipeKind = "pass" | "save" | "want";

export type Action =
  | { type: "hydrate"; local: LocalState }
  | { type: "login"; studentId: string; at: string }
  | { type: "loginProfessor" }
  | { type: "logout" }
  | { type: "consent"; studentId: string; at: string }
  | { type: "answerGalera"; studentId: string; scenarioId: string; key: string }
  | { type: "finishGalera"; studentId: string; at: string }
  | { type: "answerSemana"; studentId: string; scenarioId: string; key: string }
  | { type: "finishSemana"; studentId: string; at: string; semanaRef: string }
  | { type: "swipe"; studentId: string; careerId: string; kind: SwipeKind; at: string }
  | { type: "unsave"; studentId: string; careerId: string }
  | { type: "preferMentor"; studentId: string; mentorId: string }
  | { type: "finishMission"; studentId: string; skillCode: string; acertos: number; at: string }
  | { type: "chatTurn"; studentId: string; careerId: string; turn: ChatTurn }
  | { type: "resetChat"; studentId: string; careerId: string }
  | { type: "awardMiniChallenge"; studentId: string; sessionId: string; at: string }
  | { type: "simulateSemester"; studentId: string; at: string }
  | { type: "setMatch"; studentId: string; match: MatchResult }
  | { type: "scheduleMatch"; studentId: string; quando: string }
  | { type: "markConversation"; studentId: string; nota: string; at: string }
  | { type: "savePlan"; plan: LessonPlan }
  | { type: "approvePlan"; planId: string; at: string }
  | { type: "cacheAI"; studentId: string; key: string; value: unknown }
  | { type: "markSource"; source: AiSource }
  | { type: "toast"; texto: string; pontos?: number }
  | { type: "dismissToast"; id: number }
  | { type: "resetDemo" };

/* ---------- Helpers puros ---------- */
let toastSeq = 1;

const ROTULO_PONTOS: Record<PointEventType, string> = {
  galera_concluido: "por terminar o Da Galera",
  desafio_semana: "Seu perfil ficou mais afiado",
  carreira_explorada: "por explorar uma carreira",
  missao_concluida: "missão concluída",
  missao_aprovada: "você evoluiu",
  habilidade_subiu: "habilidade subiu de nível",
  presenca_semana: "presença em dia",
  mini_desafio_mentor: "Mandou bem!",
};

function aluno(local: LocalState, id: string): StudentLocal {
  return local.porAluno[id] ?? emptyStudentLocal();
}

function withAluno(local: LocalState, id: string, fn: (a: StudentLocal) => StudentLocal): LocalState {
  return { ...local, porAluno: { ...local.porAluno, [id]: fn(aluno(local, id)) } };
}

export function pontosDoAluno(local: LocalState, studentId: string): number {
  const s = getStudent(studentId);
  return totalPontos(s?.pontosSeed ?? 0, aluno(local, studentId).eventos);
}

/** Valida e aplica pedidos de pontos; devolve os eventos aceitos. */
function award(local: LocalState, studentId: string, pedidos: EventoPedido[]): { local: LocalState; ganhos: PointEvent[] } {
  const ganhos: PointEvent[] = [];
  let historico = aluno(local, studentId).eventos;
  for (const p of pedidos) {
    const nivel = nivelPorPontos(pontosDoAluno({ ...local, porAluno: { ...local.porAluno, [studentId]: { ...aluno(local, studentId), eventos: historico } } }, studentId));
    if (!podeGanhar(p, historico, { nivel })) continue;
    const ev = pontuar(p);
    ganhos.push(ev);
    historico = [...historico, ev];
  }
  return { local: withAluno(local, studentId, (a) => ({ ...a, eventos: historico })), ganhos };
}

function toastsFor(ganhos: PointEvent[]): Toast[] {
  if (!ganhos.length) return [];
  const total = ganhos.reduce((s, g) => s + g.pontos, 0);
  const principal = ganhos[ganhos.length - 1];
  return [{ id: toastSeq++, pontos: total, texto: ROTULO_PONTOS[principal.type] }];
}

const toggle = (xs: string[], x: string) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);
const addUnique = (xs: string[], x: string) => (xs.includes(x) ? xs : [...xs, x]);

/* ---------- Reducer ---------- */
export function reducer(state: StoreState, action: Action): StoreState {
  const { local, ui } = state;
  const next = (l: LocalState, extra: Partial<UiState> = {}): StoreState => ({ local: l, ui: { ...ui, ...extra } });
  const withPoints = (l: LocalState, studentId: string, pedidos: EventoPedido[]): StoreState => {
    const r = award(l, studentId, pedidos);
    return next(r.local, { toasts: [...ui.toasts, ...toastsFor(r.ganhos)] });
  };

  switch (action.type) {
    case "hydrate":
      return { local: action.local, ui: { ...ui, hydrated: true } };

    case "login": {
      const l = withAluno(local, action.studentId, (a) => ({ ...a, ultimoAcesso: action.at }));
      return next({ ...l, sessao: { role: "aluno", studentId: action.studentId } });
    }
    case "loginProfessor":
      return next({ ...local, sessao: { role: "professor" } });
    case "logout":
      return next({ ...local, sessao: undefined });

    case "consent":
      return next(withAluno(local, action.studentId, (a) => ({ ...a, consentAt: a.consentAt ?? action.at })));

    case "answerGalera":
      return next(withAluno(local, action.studentId, (a) => ({
        ...a, galera: { ...a.galera, respostas: { ...a.galera.respostas, [action.scenarioId]: action.key } },
      })));
    case "finishGalera": {
      const l = withAluno(local, action.studentId, (a) => ({ ...a, galera: { ...a.galera, concluidoEm: a.galera.concluidoEm ?? action.at } }));
      return withPoints(l, action.studentId, [{ type: "galera_concluido", at: action.at }]);
    }
    case "answerSemana":
      return next(withAluno(local, action.studentId, (a) => ({
        ...a, semana: { ...a.semana, respostas: { ...a.semana.respostas, [action.scenarioId]: action.key } },
      })));
    case "finishSemana": {
      const l = withAluno(local, action.studentId, (a) => ({ ...a, semana: { ...a.semana, concluidoEm: action.at } }));
      return withPoints(l, action.studentId, [{ type: "desafio_semana", ref: action.semanaRef, at: action.at }]);
    }

    case "swipe": {
      const { careerId, kind } = action;
      const l = withAluno(local, action.studentId, (a) => {
        const sw = a.swipe;
        if (kind === "pass") return { ...a, swipe: { ...sw, passadas: [...sw.passadas.filter((x) => x !== careerId), careerId] } };
        if (kind === "save") return { ...a, swipe: { ...sw, salvas: addUnique(sw.salvas, careerId), passadas: sw.passadas.filter((x) => x !== careerId) } };
        return {
          ...a,
          swipe: {
            ...sw,
            queroConhecer: addUnique(sw.queroConhecer, careerId),
            salvas: addUnique(sw.salvas, careerId),
            passadas: sw.passadas.filter((x) => x !== careerId),
          },
        };
      });
      if (kind === "want") return withPoints(l, action.studentId, [{ type: "carreira_explorada", ref: careerId, at: action.at }]);
      return next(l);
    }
    case "unsave":
      return next(withAluno(local, action.studentId, (a) => ({
        ...a, swipe: { ...a.swipe, salvas: a.swipe.salvas.filter((x) => x !== action.careerId), queroConhecer: a.swipe.queroConhecer.filter((x) => x !== action.careerId) },
      })));

    case "preferMentor":
      return next(withAluno(local, action.studentId, (a) => ({ ...a, preferenciasMentor: toggle(a.preferenciasMentor, action.mentorId) })));

    case "finishMission": {
      const { studentId, skillCode, acertos, at } = action;
      const a0 = aluno(local, studentId);
      const atual = skillStatuses(getReportCard(studentId), a0.skillOverrides).find((s) => s.code === skillCode);
      const levelAntes = atual?.level ?? "defasagem";
      const aprovada = acertos >= LIMITES.acertosParaAprovar;
      const pedidos: EventoPedido[] = [{ type: "missao_concluida", ref: skillCode, at }];
      let l = withAluno(local, studentId, (a) => ({
        ...a, missoes: [...a.missoes, { skillCode, acertos, total: 4, at }],
      }));
      if (aprovada) {
        pedidos.push({ type: "missao_aprovada", ref: skillCode, at });
        const novo = proximoNivelHabilidade(levelAntes);
        const subidaRef = `${skillCode}:${levelAntes}->${novo}`;
        const histor = aluno(l, studentId).eventos;
        if (novo !== levelAntes && podeGanhar({ type: "habilidade_subiu", ref: subidaRef, at }, histor)) {
          pedidos.push({ type: "habilidade_subiu", ref: subidaRef, at });
          l = withAluno(l, studentId, (a) => ({ ...a, skillOverrides: { ...a.skillOverrides, [skillCode]: { level: novo, at } } }));
        }
      }
      return withPoints(l, studentId, pedidos);
    }

    case "chatTurn":
      return next(withAluno(local, action.studentId, (a) => ({
        ...a, chats: { ...a.chats, [action.careerId]: [...(a.chats[action.careerId] ?? []), action.turn] },
      })));
    case "resetChat":
      return next(withAluno(local, action.studentId, (a) => ({ ...a, chats: { ...a.chats, [action.careerId]: [] } })));
    case "awardMiniChallenge":
      return withPoints(local, action.studentId, [{ type: "mini_desafio_mentor", ref: action.sessionId, at: action.at }]);

    case "simulateSemester": {
      const s = getStudent(action.studentId);
      if (!s) return state;
      const eventos = simularSemestre(s, aluno(local, action.studentId).eventos, action.at);
      const l = { ...local, semestreSimulado: true };
      return withPoints(l, action.studentId, eventos.map((e) => ({ type: e.type, ref: e.ref, at: e.at })));
    }
    case "setMatch":
      return next(withAluno(local, action.studentId, (a) => ({ ...a, match: action.match })));
    case "scheduleMatch":
      return next(withAluno(local, action.studentId, (a) => (a.match ? { ...a, match: { ...a.match, agendadoPara: action.quando } } : a)));

    case "markConversation":
      return next({ ...local, alertas: { ...local.alertas, [action.studentId]: { conversouEm: action.at, nota: action.nota.slice(0, LIMITES.notaConversaMaxChars) } } });

    case "savePlan": {
      const exists = local.planos.some((p) => p.id === action.plan.id);
      const planos = exists ? local.planos.map((p) => (p.id === action.plan.id ? action.plan : p)) : [...local.planos, action.plan];
      return next({ ...local, planos });
    }
    case "approvePlan":
      return next({ ...local, planos: local.planos.map((p) => (p.id === action.planId ? { ...p, status: "aprovado", aprovadoEm: action.at } : p)) });

    case "cacheAI":
      return next(withAluno(local, action.studentId, (a) => ({ ...a, iaCache: { ...a.iaCache, [action.key]: action.value } })));
    case "markSource":
      return action.source === "fallback" && !ui.aiOffline ? next(local, { aiOffline: true }) : state;

    case "toast":
      return next(local, { toasts: [...ui.toasts, { id: toastSeq++, texto: action.texto, pontos: action.pontos }] });
    case "dismissToast":
      return next(local, { toasts: ui.toasts.filter((t) => t.id !== action.id) });

    case "resetDemo":
      return { local: { ...initialState(), sessao: local.sessao }, ui: { ...ui, aiOffline: false, toasts: [] } };
  }
}

/* ---------- Provider ---------- */
interface Ctx { state: LocalState; ui: UiState; dispatch: React.Dispatch<Action>; }
const StoreContext = createContext<Ctx | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [store, dispatch] = useReducer(reducer, undefined, () => ({
    local: initialState(),
    ui: { hydrated: false, aiOffline: false, toasts: [] },
  }));
  const skipNextSave = useRef(false);

  useEffect(() => {
    dispatch({ type: "hydrate", local: load() });
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      skipNextSave.current = true;
      dispatch({ type: "hydrate", local: load() });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!store.ui.hydrated) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    const t = window.setTimeout(() => save(store.local), 200);
    return () => window.clearTimeout(t);
  }, [store.local, store.ui.hydrated]);

  const value = useMemo(() => ({ state: store.local, ui: store.ui, dispatch }), [store]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore precisa estar dentro de <AppStoreProvider>");
  return ctx;
}

/** Ações com `at` preenchido e reset que também limpa o storage. */
export function useActions() {
  const { dispatch } = useAppStore();
  const now = () => new Date().toISOString();
  return {
    dispatch,
    now,
    resetDemo: useCallback(() => { resetStorage(); dispatch({ type: "resetDemo" }); }, [dispatch]),
  };
}

export function useSessionStudentId(): string | undefined {
  const { state } = useAppStore();
  return state.sessao?.role === "aluno" ? state.sessao.studentId : undefined;
}
