import { Type } from "@google/genai";
import { z } from "zod";

/**
 * Para cada rota: zod da ENTRADA (400 se inválida), zod da SAÍDA da IA
 * e o `responseSchema` (subset OpenAPI) enviado ao Gemini.
 * O que o servidor completa (ids, skillCode, citações, status…) não é pedido à IA.
 */

const texto = (max = 500) => z.string().trim().min(1).max(max);
const serie = z.union([z.literal(1), z.literal(2), z.literal(3)]);
const skillLevel = z.enum(["defasagem", "em_desenvolvimento", "dominada"]);
const codigoBncc = z.string().regex(/^EM13[A-Z]{2,3}\d{2,3}$/, "código BNCC inválido");
const nota = z.number().min(0).max(100);
/** ids pseudônimos e slugs: nunca texto livre (não vão ao prompt como instrução). */
const id = (max = 80) => z.string().regex(new RegExp(`^[A-Za-z0-9_-]{1,${max}}$`), "id inválido");
/** Interesse (tag de carreira): só letras, números, espaço e hífen. Bloqueia instruções embutidas. */
const interesse = z
  .string()
  .trim()
  .regex(/^[\p{L}\p{N} -]{2,30}$/u, "interesse deve ter só letras, números e espaços (2–30)");

export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9%,./-]+/g, " ")
    .trim();
}

export const affinityProfile = z.object({
  analisar: nota,
  tech: nota,
  criar: nota,
  cuidar: nota,
  negocios: nota,
  esportes: nota,
});

/* =================== /api/diagnostico =================== */

export const diagnosticoInput = z.object({
  studentId: id(40),
  serie,
  skills: z
    .array(z.object({ code: codigoBncc, level: skillLevel, descricaoJovem: texto(200) }))
    .min(1)
    .max(30),
});
export type DiagnosticoInput = z.infer<typeof diagnosticoInput>;

export const diagnosticoOutput = z.object({
  resumo: z.string().min(1),
  destaques: z.array(z.string().min(1)).min(1).max(3),
  proximosPassos: z.array(z.string().min(1)).min(1).max(3),
});
export type DiagnosticoOutput = z.infer<typeof diagnosticoOutput>;

export const diagnosticoSchema = {
  type: Type.OBJECT,
  properties: {
    resumo: { type: Type.STRING },
    destaques: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: "2", maxItems: "2" },
    proximosPassos: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: "2", maxItems: "2" },
  },
  required: ["resumo", "destaques", "proximosPassos"],
  propertyOrdering: ["resumo", "destaques", "proximosPassos"],
};

/* =================== /api/galera =================== */

export const galeraInput = z.object({
  studentId: id(40),
  perfil: affinityProfile,
  top4: z
    .array(z.object({ id: id(), nome: texto(120), skills: z.array(z.string()).max(10) }))
    .min(1)
    .max(4),
  destravar: z.object({ code: codigoBncc, descricaoJovem: texto(200), status: skillLevel }),
});
export type GaleraInput = z.infer<typeof galeraInput>;

/** Saída final da rota (Record por careerId). */
export interface GaleraData {
  porQueCombina: Record<string, string>;
  destravarTexto: string;
}

/** Saída pedida à IA (lista, porque o Gemini não aceita chaves dinâmicas). */
export const galeraOutput = z.object({
  porQueCombina: z.array(z.object({ id: z.string(), frase: z.string().min(1) })).min(1),
  destravarTexto: z.string().min(1),
});
export type GaleraOutput = z.infer<typeof galeraOutput>;

export const galeraSchema = {
  type: Type.OBJECT,
  properties: {
    porQueCombina: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { id: { type: Type.STRING }, frase: { type: Type.STRING } },
        required: ["id", "frase"],
        propertyOrdering: ["id", "frase"],
      },
    },
    destravarTexto: { type: Type.STRING },
  },
  required: ["porQueCombina", "destravarTexto"],
  propertyOrdering: ["porQueCombina", "destravarTexto"],
};

/* =================== /api/missao =================== */

export const missaoInput = z.object({
  skillCode: codigoBncc,
  interesse,
  serie,
});
export type MissaoInput = z.infer<typeof missaoInput>;

export const quizOutput = z.object({
  titulo: z.string().min(1),
  questoes: z
    .array(
      z.object({
        enunciado: z.string().min(1),
        alternativas: z
          .array(z.string().trim().min(1))
          .length(4)
          .refine((a) => new Set(a.map((x) => x.toLowerCase())).size === 4, "alternativas repetidas"),
        correta: z.number().int().min(0).max(3),
        /** Texto da alternativa correta, repetido pela IA: confere o índice `correta`. */
        respostaCorreta: z.string().min(1),
        explicacao: z.string().min(1),
      }),
    )
    .length(4)
    .refine(
      (qs) => qs.every((q) => normalizar(q.alternativas[q.correta]) === normalizar(q.respostaCorreta)),
      "gabarito inconsistente: respostaCorreta não é a alternativa marcada em correta",
    ),
});
export type QuizOutput = z.infer<typeof quizOutput>;

export const quizSchema = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING },
    questoes: {
      type: Type.ARRAY,
      minItems: "4",
      maxItems: "4",
      items: {
        type: Type.OBJECT,
        properties: {
          enunciado: { type: Type.STRING },
          alternativas: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: "4", maxItems: "4" },
          correta: { type: Type.INTEGER, minimum: 0, maximum: 3 },
          respostaCorreta: { type: Type.STRING },
          explicacao: { type: Type.STRING },
        },
        required: ["enunciado", "alternativas", "correta", "respostaCorreta", "explicacao"],
        propertyOrdering: ["enunciado", "alternativas", "respostaCorreta", "correta", "explicacao"],
      },
    },
  },
  required: ["titulo", "questoes"],
  propertyOrdering: ["titulo", "questoes"],
};

/* =================== /api/mentor-simulado =================== */

const miniDesafio = z.object({ skillCode: codigoBncc, enunciado: z.string().min(1).max(400) });

export const mentorInput = z
  .object({
  careerId: id(),
  skillCode: codigoBncc,
  serie,
  historico: z
    .array(z.object({ role: z.enum(["aluno", "mentor"]), texto: texto(500), at: z.string().max(40) }))
    .min(1)
    .max(12),
  desafioAberto: miniDesafio.optional(),
  /** true se o mini-desafio desta sessão já foi resolvido (o servidor não abre outro). */
  desafioJaResolvido: z.boolean().optional(),
  })
  .refine((i) => i.historico[i.historico.length - 1]?.role === "aluno", {
    message: "a última mensagem do histórico deve ser do estudante",
    path: ["historico"],
  })
  .refine((i) => !i.desafioAberto || i.desafioAberto.skillCode === i.skillCode, {
    message: "desafioAberto.skillCode deve ser igual a skillCode",
    path: ["desafioAberto"],
  });
export type MentorInput = z.infer<typeof mentorInput>;

export const mentorOutput = z.object({
  fala: z.string().min(1),
  miniDesafio: z.object({ skillCode: z.string().optional(), enunciado: z.string().min(1) }).optional(),
  desafioResolvido: z.boolean().optional(),
});
export type MentorOutput = z.infer<typeof mentorOutput>;

export const mentorSchema = {
  type: Type.OBJECT,
  properties: {
    fala: { type: Type.STRING },
    miniDesafio: {
      type: Type.OBJECT,
      properties: { enunciado: { type: Type.STRING } },
      required: ["enunciado"],
    },
    desafioResolvido: { type: Type.BOOLEAN },
  },
  required: ["fala"],
  propertyOrdering: ["fala", "miniDesafio", "desafioResolvido"],
};

/* =================== /api/match =================== */

const skillStatus = z.object({
  code: z.string(),
  level: skillLevel,
  media: z.number(),
  tendencia: z.enum(["subindo", "estavel", "caindo"]),
  progresso: z.number(),
  subiuEm: z.string().optional(),
});

export const matchInput = z.object({
  snapshot: z.object({
    studentId: id(40),
    serie,
    nivel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    perfil: affinityProfile,
    top4: z.array(z.string()).max(4),
    salvas: z.array(z.string()).max(15),
    queroConhecer: z.array(z.string()).max(15),
    preferenciasMentor: z.array(z.string()).max(12),
    skills: z.array(skillStatus).max(30),
    evolucoes: z.number().min(0),
    missoes: z.number().min(0),
    frequenciaMedia: z.number().min(0).max(100),
    galeraConcluido: z.boolean(),
  }),
});
export type MatchInput = z.infer<typeof matchInput>;

export const matchOutput = z.object({
  explicacao: z.string().min(1),
  perguntasSugeridas: z.array(z.string().min(1)).min(1).max(3),
});
export type MatchOutput = z.infer<typeof matchOutput>;

export const matchSchema = {
  type: Type.OBJECT,
  properties: {
    explicacao: { type: Type.STRING },
    perguntasSugeridas: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: "3", maxItems: "3" },
  },
  required: ["explicacao", "perguntasSugeridas"],
  propertyOrdering: ["explicacao", "perguntasSugeridas"],
};

/* =================== /api/plano-aula =================== */

export const planoInput = z.object({
  classId: z.enum(["1A", "2A", "3A"]),
  skillCode: codigoBncc,
  interesse,
  /** Percentuais (somam ~100) ou contagens (somam nAlunos) — o servidor normaliza. */
  distribuicao: z.object({ defasagem: z.number().min(0), em_desenvolvimento: z.number().min(0), dominada: z.number().min(0) }),
  nAlunos: z.number().int().min(1).max(60),
  notasProfessor: z.string().max(500).optional(),
});
export type PlanoInput = z.infer<typeof planoInput>;

export const planoOutput = z.object({
  titulo: z.string().min(1),
  objetivo: z.string().min(1),
  etapas: z
    .array(
      z.object({
        nome: z.string().min(1),
        minutos: z.number().int().min(1).max(50),
        descricao: z.string().min(1),
        citacoes: z.array(z.number().int()).default([]),
      }),
    )
    .min(3)
    .max(5),
  avaliacao: z.string().min(1),
  adaptacoes: z.array(z.object({ nivel: skillLevel, sugestao: z.string().min(1) })).min(1).max(3),
  seloEtico: z
    .array(
      z.object({
        criterio: z.string().min(1),
        atendido: z.boolean(),
        comoAtende: z.string().min(1),
        citacao: z.number().int().optional(),
      }),
    )
    .min(1)
    .max(6),
});
export type PlanoOutput = z.infer<typeof planoOutput>;

export const planoSchema = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING },
    objetivo: { type: Type.STRING },
    etapas: {
      type: Type.ARRAY,
      minItems: "3",
      maxItems: "5",
      items: {
        type: Type.OBJECT,
        properties: {
          nome: { type: Type.STRING },
          minutos: { type: Type.INTEGER },
          descricao: { type: Type.STRING },
          citacoes: { type: Type.ARRAY, items: { type: Type.INTEGER } },
        },
        required: ["nome", "minutos", "descricao", "citacoes"],
        propertyOrdering: ["nome", "minutos", "descricao", "citacoes"],
      },
    },
    avaliacao: { type: Type.STRING },
    adaptacoes: {
      type: Type.ARRAY,
      minItems: "3",
      maxItems: "3",
      items: {
        type: Type.OBJECT,
        properties: {
          nivel: { type: Type.STRING, enum: ["defasagem", "em_desenvolvimento", "dominada"] },
          sugestao: { type: Type.STRING },
        },
        required: ["nivel", "sugestao"],
        propertyOrdering: ["nivel", "sugestao"],
      },
    },
    seloEtico: {
      type: Type.ARRAY,
      minItems: "4",
      maxItems: "4",
      items: {
        type: Type.OBJECT,
        properties: {
          criterio: { type: Type.STRING },
          atendido: { type: Type.BOOLEAN },
          comoAtende: { type: Type.STRING },
          citacao: { type: Type.INTEGER },
        },
        required: ["criterio", "atendido", "comoAtende"],
        propertyOrdering: ["criterio", "atendido", "comoAtende", "citacao"],
      },
    },
  },
  required: ["titulo", "objetivo", "etapas", "avaliacao", "adaptacoes", "seloEtico"],
  propertyOrdering: ["titulo", "objetivo", "etapas", "avaliacao", "adaptacoes", "seloEtico"],
};
