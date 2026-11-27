import type { Grafo } from "./grafo";
import type { Dominio, EstadoAluno, ModoResposta, Resposta, StatusCompetencia, TipoConteudo } from "./tipos";

/**
 * Domínio por competência (aresta DOMINA). Regras determinísticas, nunca decididas por IA.
 *
 * score ∈ [0, 1], média móvel exponencial das evidências:
 *   score ← score + α · (alvo − score)
 *   alvo = 1 se acertou, 0 se errou; estudo (aula) puxa para TETO_ESTUDO e nunca derruba.
 *   α por modo: prática 0,30 · quiz 0,25 · flashcard 0,15 · estudo 0,10.
 * Sem histórico, o ponto de partida é SCORE_INICIAL (ou o nível vindo do boletim).
 *
 * Esse score é um sinal fino para a trilha e o tutor. O nível oficial da habilidade
 * (ficha, mapa do professor, pontos) continua em lib/domain/diagnostico.ts.
 */
export const LIMIAR_DOMINADA = 0.7;
export const LIMIAR_LACUNA = 0.4;
export const SCORE_INICIAL = 0.3;
const TETO_ESTUDO = 0.6;
export const MAX_RESPOSTAS = 200;

const ALFA: Record<ModoResposta, number> = { pratica: 0.3, quiz: 0.25, flashcard: 0.15, estudo: 0.1 };
export const MODO_POR_TIPO: Record<TipoConteudo, ModoResposta> = {
  quiz: "quiz",
  flashcard: "flashcard",
  aula: "estudo",
  atividade_pratica: "pratica",
};

const arred = (n: number) => Math.round(n * 1000) / 1000;

export function statusDe(d: Dominio | undefined): StatusCompetencia {
  if (!d || d.tentativas === 0) return "nao_iniciada";
  if (d.score >= LIMIAR_DOMINADA) return "dominada";
  if (d.score < LIMIAR_LACUNA) return "lacuna";
  return "em_desenvolvimento";
}

export function domina(estado: EstadoAluno, codigo: string): boolean {
  return statusDe(estado.dominio[codigo]) === "dominada";
}

/**
 * Estado inicial a partir do boletim (SkillStatus de lib/domain), quando houver:
 * dominada → 0,8 · em desenvolvimento → 0,55 · defasagem → 0,25 (tentativas = 1: é evidência).
 * Competências-base (BASE-*) começam sem domínio registrado.
 */
export function estadoInicial(
  alunoId: string,
  skills: { code: string; level: "defasagem" | "em_desenvolvimento" | "dominada" }[] = [],
  agora = new Date().toISOString(),
): EstadoAluno {
  const base = { dominada: 0.8, em_desenvolvimento: 0.55, defasagem: 0.25 } as const;
  return {
    alunoId,
    dominio: Object.fromEntries(skills.map((s) => [s.code, { score: base[s.level], tentativas: 1, ultima_pratica: agora }])),
    respostas: [],
  };
}

export class RespostaInvalida extends Error {}

/**
 * Registra uma interação (RESPONDEU) e recalcula DOMINA de cada competência que o conteúdo
 * TRABALHA. Imutável: devolve um novo estado. Valida o conteúdo e a coerência modo × correto.
 */
export function registrarResposta(
  grafo: Grafo,
  estado: EstadoAluno,
  r: { conteudoId: string; correto: boolean | null; criado_em?: string },
): EstadoAluno {
  const conteudo = grafo.conteudos.get(r.conteudoId);
  if (!conteudo) throw new RespostaInvalida(`conteúdo ${r.conteudoId} não existe no grafo`);
  const modo = MODO_POR_TIPO[conteudo.tipo];
  if (modo === "estudo" && r.correto !== null) throw new RespostaInvalida("estudo não tem certo/errado (correto: null)");
  if (modo !== "estudo" && r.correto === null) throw new RespostaInvalida(`${conteudo.tipo} exige correto: true/false`);
  const criado_em = r.criado_em ?? new Date().toISOString();

  const dominio = { ...estado.dominio };
  for (const cod of conteudo.trabalha) {
    const atual = dominio[cod] ?? { score: SCORE_INICIAL, tentativas: 0, ultima_pratica: criado_em };
    const alvo = modo === "estudo" ? Math.max(atual.score, TETO_ESTUDO) : r.correto ? 1 : 0;
    const score = arred(Math.min(1, Math.max(0, atual.score + ALFA[modo] * (alvo - atual.score))));
    dominio[cod] = { score, tentativas: atual.tentativas + 1, ultima_pratica: criado_em };
  }
  const resposta: Resposta = { conteudoId: conteudo.id, correto: r.correto, modo, criado_em };
  return { ...estado, dominio, respostas: [...estado.respostas, resposta].slice(-MAX_RESPOSTAS) };
}

/** Erros nas últimas `n` respostas a conteúdos que trabalham a competência. */
export function errosRecentes(grafo: Grafo, estado: EstadoAluno, codigo: string, n = 3): number {
  return estado.respostas
    .filter((r) => grafo.conteudos.get(r.conteudoId)?.trabalha.includes(codigo))
    .slice(-n)
    .filter((r) => r.correto === false).length;
}
