import { z } from "zod";

/**
 * Grafo educacional (property graph em memória, D63).
 * Equivalência com o modelo Neo4j do roadmap (docs/11):
 *   Competencia ↔ (:Competencia) · Conteudo ↔ (:Conteudo) · Conceito ↔ (:Conceito)
 *   prerequisitos[] ↔ (:Competencia)-[:PRE_REQUISITO_DE {peso}]->(:Competencia)
 *   Conteudo.trabalha ↔ (:Conteudo)-[:TRABALHA]->(:Competencia)
 *   Conteudo.explica ↔ (:Conteudo)-[:EXPLICA]->(:Conceito)
 *   EstadoAluno.dominio ↔ (:Aluno)-[:DOMINA {score, tentativas, ultima_pratica}]->(:Competencia)
 *   EstadoAluno.respostas ↔ (:Aluno)-[:RESPONDEU {correto, modo, criado_em}]->(:Conteudo)
 * Funções puras, sem I/O: rodam no cliente (estado no localStorage) e no servidor.
 */

/** Código BNCC (EM13MAT316) ou competência-base da plataforma (BASE-PORCENTAGEM). */
export const CODIGO_COMPETENCIA = /^(EM13[A-Z]{2,3}\d{2,3}|BASE-[A-Z0-9-]{2,30})$/;
const codigo = z.string().regex(CODIGO_COMPETENCIA, "código de competência inválido");
const slug = z.string().regex(/^[a-z0-9-]{2,80}$/, "id inválido");

export const competenciaSchema = z.object({
  codigo,
  titulo: z.string().min(3).max(120),
  area_bncc: z.enum(["MAT", "LGG", "CNT", "CHS"]),
  eixo_tematico: z.string().min(3).max(60),
  dificuldade: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** true = código oficial da BNCC do EM; false = competência-base criada pela curadoria. */
  bncc: z.boolean(),
});

export const preRequisitoSchema = z.object({
  /** `de` é PRE_REQUISITO_DE `para`. */
  de: codigo,
  para: codigo,
  /** 0–1: quanto `para` depende de `de` (≥ 0,7 = bloqueante). */
  peso: z.number().gt(0).max(1),
});

export const TIPOS_CONTEUDO = ["aula", "flashcard", "quiz", "atividade_pratica"] as const;
export type TipoConteudo = (typeof TIPOS_CONTEUDO)[number];

export const conteudoSchema = z.object({
  id: slug,
  tipo: z.enum(TIPOS_CONTEUDO),
  titulo: z.string().min(3).max(120),
  resumo: z.string().min(10).max(400),
  minutos: z.number().int().min(1).max(60),
  trabalha: z.array(codigo).min(1),
  explica: z.array(z.string()).default([]),
  /** Rota da UI que abre o conteúdo (ex.: missão BNCC existente). */
  rota: z.string().startsWith("/").optional(),
});

export const conceitoSchema = z.object({
  nome: z.string().min(2).max(60),
  /** Texto curto da plataforma (não é texto oficial da BNCC). */
  definicao_curta: z.string().min(10).max(240),
});

export const grafoSchema = z.object({
  versao: z.number().int().min(1),
  competencias: z.array(competenciaSchema).min(1),
  prerequisitos: z.array(preRequisitoSchema),
  conteudos: z.array(conteudoSchema),
  conceitos: z.array(conceitoSchema),
});

export type Competencia = z.infer<typeof competenciaSchema>;
export type PreRequisito = z.infer<typeof preRequisitoSchema>;
export type Conteudo = z.infer<typeof conteudoSchema>;
export type Conceito = z.infer<typeof conceitoSchema>;
export type GrafoDados = z.infer<typeof grafoSchema>;

/* ---------------- estado do aluno ---------------- */

export type ModoResposta = "quiz" | "flashcard" | "estudo" | "pratica";

export interface Dominio {
  /** 0–1. */
  score: number;
  tentativas: number;
  /** ISO. */
  ultima_pratica: string;
}

export interface Resposta {
  conteudoId: string;
  /** null para estudo (aula lida), sem certo/errado. */
  correto: boolean | null;
  modo: ModoResposta;
  criado_em: string;
}

export interface EstadoAluno {
  /** Id pseudônimo (s001). Nunca o nome. */
  alunoId: string;
  dominio: Record<string, Dominio>;
  /** Mais recentes por último; limitado a MAX_RESPOSTAS. */
  respostas: Resposta[];
}

export type StatusCompetencia = "nao_iniciada" | "lacuna" | "em_desenvolvimento" | "dominada";

export const estadoAlunoSchema = z.object({
  alunoId: z.string().regex(/^[A-Za-z0-9_-]{1,40}$/),
  dominio: z.record(
    codigo,
    z.object({ score: z.number().min(0).max(1), tentativas: z.number().int().min(0), ultima_pratica: z.string() }),
  ),
  respostas: z
    .array(
      z.object({
        conteudoId: slug,
        correto: z.boolean().nullable(),
        modo: z.enum(["quiz", "flashcard", "estudo", "pratica"]),
        criado_em: z.string(),
      }),
    )
    .max(500),
});
