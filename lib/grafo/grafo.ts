import { grafoSchema, type Competencia, type Conceito, type Conteudo, type GrafoDados, type PreRequisito } from "./tipos";

/**
 * Grafo carregado e indexado. `carregarGrafo` valida o JSON (zod), as referências entre nós
 * e a ausência de ciclos em PRE_REQUISITO_DE. Falha cedo com mensagem clara.
 */
export interface Grafo {
  versao: number;
  competencias: ReadonlyMap<string, Competencia>;
  conteudos: ReadonlyMap<string, Conteudo>;
  conceitos: ReadonlyMap<string, Conceito>;
  /** Arestas que ENTRAM em `codigo` (os pré-requisitos dele). */
  preRequisitosDe(codigo: string): readonly PreRequisito[];
  /** Arestas que SAEM de `codigo` (o que depende dele). */
  dependentesDe(codigo: string): readonly PreRequisito[];
  /** Conteúdos que TRABALHAM a competência. */
  conteudosDe(codigo: string): readonly Conteudo[];
  /** Conceitos EXPLICADOS por um conteúdo. */
  conceitosDe(conteudoId: string): readonly Conceito[];
}

export class GrafoInvalido extends Error {}

export function carregarGrafo(json: unknown): Grafo {
  const parsed = grafoSchema.safeParse(json);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    throw new GrafoInvalido(`grafo inválido em ${i.path.join(".")}: ${i.message}`);
  }
  const d: GrafoDados = parsed.data;
  const erros: string[] = [];

  const competencias = new Map(d.competencias.map((c) => [c.codigo, c]));
  const conteudos = new Map(d.conteudos.map((c) => [c.id, c]));
  const conceitos = new Map(d.conceitos.map((c) => [c.nome, c]));
  if (competencias.size !== d.competencias.length) erros.push("código de competência duplicado");
  if (conteudos.size !== d.conteudos.length) erros.push("id de conteúdo duplicado");
  if (conceitos.size !== d.conceitos.length) erros.push("nome de conceito duplicado");

  const entrada = new Map<string, PreRequisito[]>();
  const saida = new Map<string, PreRequisito[]>();
  const vistos = new Set<string>();
  for (const e of d.prerequisitos) {
    if (!competencias.has(e.de)) erros.push(`pré-requisito: ${e.de} não existe`);
    if (!competencias.has(e.para)) erros.push(`pré-requisito: ${e.para} não existe`);
    if (e.de === e.para) erros.push(`pré-requisito de si mesmo: ${e.de}`);
    const k = `${e.de}>${e.para}`;
    if (vistos.has(k)) erros.push(`aresta duplicada: ${k}`);
    vistos.add(k);
    entrada.set(e.para, [...(entrada.get(e.para) ?? []), e]);
    saida.set(e.de, [...(saida.get(e.de) ?? []), e]);
  }

  const porCompetencia = new Map<string, Conteudo[]>();
  for (const c of d.conteudos) {
    for (const cod of c.trabalha) {
      if (!competencias.has(cod)) erros.push(`conteúdo ${c.id}: competência ${cod} não existe`);
      porCompetencia.set(cod, [...(porCompetencia.get(cod) ?? []), c]);
    }
    for (const n of c.explica) if (!conceitos.has(n)) erros.push(`conteúdo ${c.id}: conceito "${n}" não existe`);
  }
  for (const cod of competencias.keys()) {
    if (!porCompetencia.has(cod)) erros.push(`competência ${cod} sem conteúdo`);
  }

  // Ciclo em PRE_REQUISITO_DE tornaria a trilha impossível.
  const estado = new Map<string, 1 | 2>();
  const visitar = (cod: string, caminho: string[]) => {
    if (estado.get(cod) === 2) return;
    if (estado.get(cod) === 1) {
      erros.push(`ciclo de pré-requisitos: ${[...caminho, cod].join(" → ")}`);
      return;
    }
    estado.set(cod, 1);
    for (const e of saida.get(cod) ?? []) visitar(e.para, [...caminho, cod]);
    estado.set(cod, 2);
  };
  for (const cod of competencias.keys()) visitar(cod, []);

  if (erros.length) throw new GrafoInvalido(`grafo inválido:\n- ${[...new Set(erros)].join("\n- ")}`);

  return {
    versao: d.versao,
    competencias,
    conteudos,
    conceitos,
    preRequisitosDe: (cod) => entrada.get(cod) ?? [],
    dependentesDe: (cod) => saida.get(cod) ?? [],
    conteudosDe: (cod) => porCompetencia.get(cod) ?? [],
    conceitosDe: (id) => (conteudos.get(id)?.explica ?? []).map((n) => conceitos.get(n)!),
  };
}
