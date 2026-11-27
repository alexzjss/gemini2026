// docs/07 §8 — missão do dia, sugestões e resultado de uma missão
import type { Career, NivelId, PointEvent, SkillLevel, SkillStatus } from "../types";
import { LIMITES } from "../config";
import { proximoNivel } from "./diagnostico";
import { registrar } from "./pontos";
import { dia } from "./util";

export interface MissaoView {
  skills: SkillStatus[];
  careers: Career[];
  queroConhecer: string[];
  salvas: string[];
  /** top 4 do resultado (ou do perfil parcial, antes de concluir o Da Galera) */
  top4: string[];
  /** habilidades com missão concluída hoje */
  feitasHoje?: string[];
}

/** Carreira nº 1: Quero conhecer > salva > top 1. */
export function carreiraNumero1(v: MissaoView): Career | undefined {
  const id = v.queroConhecer[0] ?? v.salvas[0] ?? v.top4[0];
  return v.careers.find((c) => c.id === id);
}

const porProgresso = (a: SkillStatus, b: SkillStatus) => a.progresso - b.progresso || a.code.localeCompare(b.code);

export function missaoDoDia(v: MissaoView): string | undefined {
  const st = (code: string) => v.skills.find((s) => s.code === code);
  const c1 = carreiraNumero1(v);
  const daCarreira = c1?.skills.find((code) => {
    const s = st(code);
    return s && s.level !== "dominada";
  });
  if (daCarreira) return daCarreira;
  const naoDominadas = v.skills.filter((s) => s.level !== "dominada").sort(porProgresso);
  return (naoDominadas.find((s) => s.level === "defasagem") ?? naoDominadas[0])?.code;
}

/** As outras 2 sugestões (exclui a missão do dia e o que já foi feito hoje). */
export function sugestoes(v: MissaoView, n = 2): string[] {
  const doDia = missaoDoDia(v);
  const excluir = new Set([doDia, ...(v.feitasHoje ?? [])]);
  const marcadas = [...v.queroConhecer, ...v.salvas];
  const ligadasIds = marcadas.length ? marcadas : v.top4;
  const ligadas = new Set(v.careers.filter((c) => ligadasIds.includes(c.id)).flatMap((c) => c.skills));
  const livres = v.skills.filter((s) => !excluir.has(s.code));
  const grupos = [
    livres.filter((s) => s.level === "defasagem" && ligadas.has(s.code)),
    livres.filter((s) => s.level === "defasagem" && !ligadas.has(s.code)),
    livres.filter((s) => s.level === "em_desenvolvimento" && ligadas.has(s.code)),
  ];
  return grupos.flatMap((g) => [...g].sort(porProgresso)).slice(0, n).map((s) => s.code);
}

export interface ResultadoMissao {
  aprovada: boolean;
  eventos: PointEvent[];
  /** novo nível da habilidade, se subiu */
  override?: { level: SkillLevel; at: string };
  mensagem: string;
}

/** Fecha uma missão: +30 concluída; ≥ 3/4 → +40 aprovada e sobe 1 nível (+40), no máx. 1 subida por dia. */
export function resultadoMissao(input: {
  skill: SkillStatus;
  acertos: number;
  at: string;
  historico: PointEvent[];
  nivel?: NivelId;
}): ResultadoMissao {
  const { skill, acertos, at } = input;
  const hist = [...input.historico];
  const eventos: PointEvent[] = [];
  const push = (e: PointEvent | null) => {
    if (e) {
      eventos.push(e);
      hist.push(e);
    }
  };
  push(registrar({ type: "missao_concluida", at, ref: skill.code }, hist));
  const aprovada = acertos >= LIMITES.acertosParaAprovar;
  if (!aprovada) return { aprovada, eventos, mensagem: "Bora de novo amanhã — cada tentativa conta" };

  const aprov = registrar({ type: "missao_aprovada", at, ref: skill.code }, hist);
  push(aprov);
  let override: ResultadoMissao["override"];
  const jaSubiuHoje = input.historico.some(
    (h) => h.type === "habilidade_subiu" && h.ref?.startsWith(skill.code + ":") && dia(h.at) === dia(at),
  );
  if (aprov && skill.level !== "dominada" && !jaSubiuHoje) {
    const novo = proximoNivel(skill.level);
    const subiu = registrar({ type: "habilidade_subiu", at, ref: `${skill.code}:${skill.level}>${novo}` }, hist);
    if (subiu) {
      push(subiu);
      override = { level: novo, at };
    }
  }
  return { aprovada, eventos, override, mensagem: override ? "Subiu de nível!" : "Mandou bem!" };
}
