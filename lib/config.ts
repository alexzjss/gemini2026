/* Contrato 1 — constantes de produto e regras (docs/07-regras-de-negocio.md).
 * Dono: Agente 1. Mudanças só em PR próprio e pequeno. */
import type { AffinityAxis, NivelId, PointEventType, SkillLevel } from "./types";

export const APP_NAME = "Gemini2026";
export const STORAGE_KEY = "gemini2026:v1";
export const STORAGE_VERSION = 1 as const;

/* ---------- Níveis (07 §5) ---------- */
export interface NivelDef { id: NivelId; nome: string; min: number; abre: string; abreCurto: string; }
export const NIVEIS: readonly NivelDef[] = [
  { id: 1, nome: "Começando", min: 0, abre: "os mentores profissionais da sua região", abreCurto: "Profissionais da sua região" },
  { id: 2, nome: "Na Pista", min: 300, abre: "os mentores universitários e técnicos", abreCurto: "Universitários e técnicos" },
  { id: 3, nome: "Embalado", min: 700, abre: "mini-desafios extras do mentor simulado", abreCurto: "Mini-desafios extras" },
  { id: 4, nome: "Destravado", min: 1500, abre: "os mentores de alta demanda", abreCurto: "Alta demanda: Big Tech, medicina, executivos" },
  { id: 5, nome: "Referência", min: 2500, abre: "o selo Referência", abreCurto: "Selo Referência" },
] as const;

/* ---------- Pontos (07 §4) ---------- */
export const PONTOS: Record<PointEventType, number> = {
  galera_concluido: 50,
  desafio_semana: 10,
  carreira_explorada: 10,
  missao_concluida: 30,
  missao_aprovada: 40,
  habilidade_subiu: 40,
  presenca_semana: 15,
  mini_desafio_mentor: 20,
};

export const LIMITES = {
  // chaves usadas por lib/domain (Agente 2)
  miniDesafiosPorDia: { base: 1, aPartirDoNivel3: 3 },
  bonusSalva: 0.15,
  bonusQueroConhecer: 0.25,
  swipePorDia: 5,
  topCaminhos: 4,
  // chaves usadas pela UI/rotas
  galeraConcluido: 1,                 // 1x
  desafioSemanaPorSemana: 1,
  carreiraExploradaPorCarreira: 1,
  missaoPorHabilidadePorDia: 1,
  subidaPorHabilidadePorDia: 1,
  presencaPorSemana: 1,
  miniDesafioPorSessao: 1,
  miniDesafioPorDia: { base: 1, nivel3: 3 }, // nível 3 abre 3/dia
  acertosParaAprovar: 3,
  questoesPorQuiz: 4,
  chatMaxTurnos: 12,
  textoMaxChars: 500,
  falaMentorMaxChars: 400,
  notaConversaMaxChars: 280,
  carreirasPorDia: 5,
} as const;

/* ---------- Diagnóstico, afinidade, evasão (07 §1, §2, §7) ---------- */
export const LIMIARES = {
  diagnostico: { dominada: 7.0, emDesenvolvimento: 5.0, tendencia: 0.5, progressoMaxDefasagem: 45, bonusMissao: 15, progressoMaxAntesDeSubir: 95 },
  afinidade: { forte: 65, medio: 35, parcialAPartirDe: 3, topResultado: 4, topParcial: 3 },
  carreira: { bonusSalva: 0.15, bonusQuero: 0.25 },
  evasao: { frequenciaBaixa: 75, quedaPontos: 15, inatividadeDias: 14, habilidadesCaindo: 2 },
  presenca: 75,
  elegibilidadeFrequencia: 60,
  match: { frequenciaMinima: 60, missoesMinimas: 1, presencaSemana: 75 },
} as const;

export const PESOS_MATCH = {
  afinidade: 40,
  carreira: 25,
  preferencia: 10,
  evolucao: 15,
  engajamento: 10,
  carreiraValores: { quero: 1.0, salva: 0.8, top4: 0.6 },
  evolucoesParaMaximo: 3,
  missoesParaMaximo: 5,
} as const;

/* ---------- Semestre ---------- */
export const SEMESTRE = {
  nome: "2º semestre de 2026",
  inicio: "2026-08-03",
  fim: "2026-12-18",          // Match Day
  semanasTotal: 16,
  semanasOcorridas: 8,
} as const;

/* ---------- Rótulos ---------- */
export const EIXOS: { id: AffinityAxis; label: string }[] = [
  { id: "analisar", label: "Organizar e analisar" },
  { id: "tech", label: "Tecnologia e games" },
  { id: "criar", label: "Criar e comunicar" },
  { id: "cuidar", label: "Cuidar e ensinar" },
  { id: "negocios", label: "Negócios e liderança" },
  { id: "esportes", label: "Esportes, corpo e natureza" },
];
export const EIXO_LABEL = Object.fromEntries(EIXOS.map((e) => [e.id, e.label])) as Record<AffinityAxis, string>;

export const NIVEL_HABILIDADE_LABEL: Record<SkillLevel, string> = {
  defasagem: "bora destravar",
  em_desenvolvimento: "em desenvolvimento",
  dominada: "dominada",
};

export const INTERESSES_QUIZ = ["futebol", "games", "música", "moda", "negócios", "redes sociais"] as const;

/* ---------- Demo ---------- */
export const DEMO = {
  // Ligado por padrão (hackathon); desligue com NEXT_PUBLIC_DEMO_MODE=0.
  enabled: process.env.NEXT_PUBLIC_DEMO_MODE !== "0",
  herois: [
    { id: "s001", matricula: "2026001", label: "Kauã · 2º EM" },
    { id: "s002", matricula: "2026002", label: "Bruno · 2º EM" },
    { id: "s003", matricula: "2026003", label: "Carla · 3º EM" },
  ],
  turmaPadrao: "2A",
  classId: "2A" as const,
  heroes: { kaua: "s001", bruno: "s002", carla: "s003" },
  professorId: "prof-demo",
} as const;

export const AI = {
  timeoutMs: 15_000,
  retryDelayMs: 500,
  model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  embedModel: process.env.GEMINI_EMBED_MODEL ?? "text-embedding-004",
} as const;
