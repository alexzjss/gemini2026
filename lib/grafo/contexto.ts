import { statusDe } from "./dominio";
import type { Grafo } from "./grafo";
import type { Competencia, Conceito, Conteudo, EstadoAluno, StatusCompetencia } from "./tipos";
import { CODIGO_COMPETENCIA } from "./tipos";
import { lacunas } from "./trilha";

/**
 * Parte "graph" do GraphRAG (pura, sem I/O): a partir da pergunta do aluno, encontra no grafo
 * as competências e conceitos ligados, expande para os pré-requisitos e anota o status do aluno.
 * A parte "RAG" (trechos literais da BNCC) fica em lib/rag/graphrag.ts, no servidor.
 *
 * Âncoras, em ordem: códigos citados na pergunta → conceitos citados → títulos de competências
 * e conteúdos com ≥ 2 palavras em comum. Nada é inventado: se não houver âncora, o contexto vem vazio.
 */

export interface ContextoGrafo {
  competencias: { codigo: string; titulo: string; bncc: boolean; status: StatusCompetencia }[];
  /** Pré-requisitos não dominados das competências ancoradas, em ordem de estudo. */
  preRequisitosPendentes: { codigo: string; titulo: string; status: StatusCompetencia; bloqueante: boolean }[];
  conceitos: Conceito[];
  /** Conteúdos que o tutor pode indicar (aula/flashcard/prática), no máximo 3. */
  conteudosSugeridos: { id: string; tipo: Conteudo["tipo"]; titulo: string; rota?: string }[];
  /** Códigos BNCC oficiais envolvidos (para buscar o texto literal no corpus). */
  codigosBncc: string[];
}

const STOP = new Set("a o as os um uma de do da dos das em no na nos nas por pra para com que se e ou é como qual quais quando porque por que isso esse essa meu minha".split(" "));
export function palavras(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP.has(t))
    .map((t) => (t.length > 4 && t.endsWith("s") ? t.slice(0, -1) : t));
}

export function contextoDoGrafo(
  grafo: Grafo,
  estado: EstadoAluno,
  pergunta: string,
  o: { maxCompetencias?: number } = {},
): ContextoGrafo {
  const max = o.maxCompetencias ?? 3;
  const pq = new Set(palavras(pergunta));
  const ancoras: Competencia[] = [];
  const conceitos = new Map<string, Conceito>();
  const ancorar = (c: Competencia | undefined) => {
    if (c && ancoras.length < max && !ancoras.includes(c)) ancoras.push(c);
  };

  // 1) códigos citados (só os que existem no grafo)
  for (const tok of pergunta.toUpperCase().match(/EM13[A-Z]{2,3}\d{2,3}|BASE-[A-Z0-9-]+/g) ?? []) {
    if (CODIGO_COMPETENCIA.test(tok)) ancorar(grafo.competencias.get(tok));
  }

  // 2) conceitos citados pelo nome → competências dos conteúdos que os explicam
  for (const conceito of grafo.conceitos.values()) {
    const nome = palavras(conceito.nome);
    if (!nome.length || !nome.every((p) => pq.has(p))) continue;
    conceitos.set(conceito.nome, conceito);
    for (const ct of grafo.conteudos.values()) {
      if (ct.explica.includes(conceito.nome)) ct.trabalha.forEach((cod) => ancorar(grafo.competencias.get(cod)));
    }
  }

  // 3) sobreposição com títulos (competências e conteúdos)
  const comum = (texto: string) => palavras(texto).filter((p) => pq.has(p)).length;
  const porTitulo = [...grafo.competencias.values()]
    .map((c) => ({
      c,
      s: Math.max(comum(`${c.titulo} ${c.eixo_tematico}`), ...grafo.conteudosDe(c.codigo).map((ct) => comum(`${ct.titulo} ${ct.resumo}`))),
    }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s);
  porTitulo.forEach(({ c }) => ancorar(c));

  // Expansão: pré-requisitos pendentes + conceitos dos conteúdos das âncoras.
  const pendentes = new Map<string, ContextoGrafo["preRequisitosPendentes"][number]>();
  for (const a of ancoras) {
    for (const l of lacunas(grafo, estado, a.codigo)) {
      if (!pendentes.has(l.competencia.codigo) && !ancoras.includes(l.competencia)) {
        pendentes.set(l.competencia.codigo, {
          codigo: l.competencia.codigo,
          titulo: l.competencia.titulo,
          status: l.status,
          bloqueante: l.bloqueante,
        });
      }
    }
  }
  const focos = [...ancoras.map((a) => a.codigo), ...pendentes.keys()];
  for (const cod of ancoras.map((a) => a.codigo)) {
    for (const ct of grafo.conteudosDe(cod)) for (const cc of grafo.conceitosDe(ct.id)) if (conceitos.size < 5) conceitos.set(cc.nome, cc);
  }
  // Sugestões (sem quiz: o tutor indica estudo/prática), começando pelo 1º pré-requisito pendente.
  const prioridade = [...pendentes.keys(), ...ancoras.map((a) => a.codigo)];
  const posicao = (ct: Conteudo) =>
    Math.min(...ct.trabalha.map((c) => (prioridade.includes(c) ? prioridade.indexOf(c) : Infinity)));
  const sugeridos = focos
    .flatMap((cod) => grafo.conteudosDe(cod))
    .filter((ct) => ct.tipo !== "quiz")
    .filter((ct, i, arr) => arr.findIndex((x) => x.id === ct.id) === i)
    .sort((a, b) => posicao(a) - posicao(b));

  const todos = [...ancoras, ...[...pendentes.keys()].map((c) => grafo.competencias.get(c)!)];
  return {
    competencias: ancoras.map((c) => ({ codigo: c.codigo, titulo: c.titulo, bncc: c.bncc, status: statusDe(estado.dominio[c.codigo]) })),
    preRequisitosPendentes: [...pendentes.values()],
    conceitos: [...conceitos.values()],
    conteudosSugeridos: sugeridos.slice(0, 3).map((ct) => ({ id: ct.id, tipo: ct.tipo, titulo: ct.titulo, ...(ct.rota ? { rota: ct.rota } : {}) })),
    codigosBncc: todos.filter((c) => c.bncc).map((c) => c.codigo),
  };
}

const ROTULO_STATUS: Record<StatusCompetencia, string> = {
  nao_iniciada: "ainda não praticou",
  lacuna: "começando",
  em_desenvolvimento: "em desenvolvimento",
  dominada: "já domina",
};

/** Bloco <grafo> para o prompt do tutor. Sem nome do aluno, sem números de score. */
export function renderContextoGrafo(ctx: ContextoGrafo): string {
  if (!ctx.competencias.length) return "<grafo>(nenhuma competência do currículo da plataforma ligada à pergunta)</grafo>";
  const linhas = [
    "Competências ligadas à pergunta:",
    ...ctx.competencias.map((c) => `- ${c.codigo} ${c.titulo} — situação do estudante: ${ROTULO_STATUS[c.status]}`),
  ];
  if (ctx.preRequisitosPendentes.length) {
    linhas.push(
      "Pré-requisitos que o estudante ainda não domina (comece a ajuda por eles, na ordem):",
      ...ctx.preRequisitosPendentes.map(
        (p) => `- ${p.codigo} ${p.titulo} — ${ROTULO_STATUS[p.status]}${p.bloqueante ? " (essencial)" : ""}`,
      ),
    );
  }
  if (ctx.conceitos.length) {
    linhas.push(
      "Conceitos (definições curtas da plataforma, não são texto oficial da BNCC):",
      ...ctx.conceitos.map((c) => `- ${c.nome}: ${c.definicao_curta}`),
    );
  }
  if (ctx.conteudosSugeridos.length) {
    linhas.push("Conteúdos da plataforma que você pode indicar:", ...ctx.conteudosSugeridos.map((c) => `- ${c.titulo} (${c.tipo})`));
  }
  return `<grafo>\n${linhas.join("\n")}\n</grafo>`;
}
