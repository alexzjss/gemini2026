import { errosRecentes, LIMIAR_LACUNA, LIMIAR_DOMINADA, statusDe } from "./dominio";
import type { Grafo } from "./grafo";
import type { Competencia, Conteudo, EstadoAluno, StatusCompetencia, TipoConteudo } from "./tipos";

/**
 * Trilha adaptativa (determinística).
 *
 * lacunas(alvo): pré-requisitos (transitivos, até PROFUNDIDADE_MAX saltos) que o aluno ainda não
 * domina, em ordem de estudo: o mais fundamental primeiro. A busca não atravessa uma competência
 * já dominada (se domina B, não cobra A, pré-requisito de B).
 *
 * proximoPasso(alvo): 1ª lacuna (ou o próprio alvo, se não houver) + o conteúdo certo para o
 * momento, pelo desempenho:
 *   sem prática ou < 0,4 com erro recente → aula → flashcard → quiz
 *   < 0,4                                  → flashcard → aula → quiz
 *   0,4 – 0,7                              → quiz → flashcard → atividade prática
 *   ≥ 0,7                                  → atividade prática → quiz
 * Evita repetir conteúdo acertado nas últimas 24h.
 */
export const PROFUNDIDADE_MAX = 3;
export const PESO_BLOQUEANTE = 0.7;
const DIA_MS = 24 * 60 * 60 * 1000;

export interface Lacuna {
  competencia: Competencia;
  status: StatusCompetencia;
  score: number | null;
  /** Saltos até o alvo (1 = pré-requisito direto). */
  distancia: number;
  /** Maior peso de aresta no caminho até o alvo; ≥ 0,7 = bloqueante. */
  peso: number;
  bloqueante: boolean;
  errosRecentes: number;
}

export function lacunas(grafo: Grafo, estado: EstadoAluno, alvo: string): Lacuna[] {
  if (!grafo.competencias.has(alvo)) throw new Error(`competência ${alvo} não existe no grafo`);
  if (statusDe(estado.dominio[alvo]) === "dominada") return [];

  // BFS reversa a partir do alvo, sem atravessar competências dominadas.
  const info = new Map<string, { distancia: number; peso: number }>();
  let fronteira = [alvo];
  for (let d = 1; d <= PROFUNDIDADE_MAX && fronteira.length; d++) {
    const prox: string[] = [];
    for (const cod of fronteira) {
      for (const e of grafo.preRequisitosDe(cod)) {
        if (statusDe(estado.dominio[e.de]) === "dominada") continue;
        const prev = info.get(e.de);
        if (!prev) {
          info.set(e.de, { distancia: d, peso: e.peso });
          prox.push(e.de);
        } else {
          prev.peso = Math.max(prev.peso, e.peso);
        }
      }
    }
    fronteira = prox;
  }

  // Ordem topológica no subgrafo das lacunas (Kahn): primeiro o que não depende de outra lacuna.
  const nos = [...info.keys()];
  const grauEntrada = new Map(nos.map((n) => [n, grafo.preRequisitosDe(n).filter((e) => info.has(e.de)).length]));
  const desempate = (a: string, b: string) =>
    info.get(b)!.distancia - info.get(a)!.distancia ||
    info.get(b)!.peso - info.get(a)!.peso ||
    grafo.competencias.get(a)!.dificuldade - grafo.competencias.get(b)!.dificuldade ||
    a.localeCompare(b);
  const ordem: string[] = [];
  let prontos = nos.filter((n) => grauEntrada.get(n) === 0).sort(desempate);
  while (prontos.length) {
    const n = prontos.shift()!;
    ordem.push(n);
    for (const e of grafo.dependentesDe(n)) {
      if (!grauEntrada.has(e.para)) continue;
      grauEntrada.set(e.para, grauEntrada.get(e.para)! - 1);
      if (grauEntrada.get(e.para) === 0) prontos = [...prontos, e.para].sort(desempate);
    }
  }

  return ordem.map((cod) => {
    const d = estado.dominio[cod];
    const { distancia, peso } = info.get(cod)!;
    return {
      competencia: grafo.competencias.get(cod)!,
      status: statusDe(d),
      score: d ? d.score : null,
      distancia,
      peso,
      bloqueante: peso >= PESO_BLOQUEANTE,
      errosRecentes: errosRecentes(grafo, estado, cod),
    };
  });
}

export interface ProximoPasso {
  competencia: Competencia;
  conteudo: Conteudo;
  /** Texto transparente para o aluno: por que este passo (sem rotular o aluno). */
  motivo: string;
  /** Lacunas que ainda faltam antes do alvo (inclui a do passo atual). */
  lacunasRestantes: number;
  alvoDominado: boolean;
}

function prioridadeDeTipos(score: number | null, erros: number): TipoConteudo[] {
  if (score === null || (score < LIMIAR_LACUNA && erros > 0)) return ["aula", "flashcard", "quiz", "atividade_pratica"];
  if (score < LIMIAR_LACUNA) return ["flashcard", "aula", "quiz", "atividade_pratica"];
  if (score < LIMIAR_DOMINADA) return ["quiz", "flashcard", "atividade_pratica", "aula"];
  return ["atividade_pratica", "quiz", "flashcard", "aula"];
}

function escolherConteudo(grafo: Grafo, estado: EstadoAluno, codigo: string, agora: number): Conteudo | null {
  const d = estado.dominio[codigo];
  const score = d && d.tentativas > 0 ? d.score : null;
  const ordem = prioridadeDeTipos(score, errosRecentes(grafo, estado, codigo));
  const acertadosHoje = new Set(
    estado.respostas
      .filter((r) => r.correto !== false && agora - Date.parse(r.criado_em) < DIA_MS)
      .map((r) => r.conteudoId),
  );
  const candidatos = grafo.conteudosDe(codigo);
  const rank = (c: Conteudo) => ordem.indexOf(c.tipo) + (acertadosHoje.has(c.id) ? 10 : 0);
  return [...candidatos].sort((a, b) => rank(a) - rank(b) || a.minutos - b.minutos || a.id.localeCompare(b.id))[0] ?? null;
}

const ROTULO_TIPO: Record<TipoConteudo, string> = {
  aula: "uma aula curta",
  flashcard: "flashcards",
  quiz: "um quiz",
  atividade_pratica: "uma atividade prática",
};

export function proximoPasso(
  grafo: Grafo,
  estado: EstadoAluno,
  alvo: string,
  agora = Date.now(),
): ProximoPasso | null {
  const gaps = lacunas(grafo, estado, alvo);
  const alvoComp = grafo.competencias.get(alvo)!;
  const foco = gaps[0]?.competencia ?? alvoComp;
  const conteudo = escolherConteudo(grafo, estado, foco.codigo, agora);
  if (!conteudo) return null;

  const alvoDominado = statusDe(estado.dominio[alvo]) === "dominada";
  const motivo =
    foco.codigo !== alvo
      ? `${foco.titulo} vem antes de ${alvoComp.titulo}. Começa por ${ROTULO_TIPO[conteudo.tipo]} (${conteudo.minutos} min).`
      : alvoDominado
        ? `Você já manda bem em ${alvoComp.titulo}. Bora aplicar com ${ROTULO_TIPO[conteudo.tipo]}.`
        : `Os pré-requisitos estão em dia. Agora é ${alvoComp.titulo}, com ${ROTULO_TIPO[conteudo.tipo]}.`;
  return { competencia: foco, conteudo, motivo, lacunasRestantes: gaps.length, alvoDominado };
}
