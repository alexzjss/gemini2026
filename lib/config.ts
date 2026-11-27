// Contrato 1 (dono: Agente 1). Constantes de docs/07. Provisório até a feat/fundacao.
import type { AffinityAxis, NivelId, PointEventType } from "./types";

export const APP_NAME = "[nome do app]";

export const EIXOS: { id: AffinityAxis; label: string }[] = [
  { id: "analisar", label: "Organizar e analisar" },
  { id: "tech", label: "Tecnologia e games" },
  { id: "criar", label: "Criar e comunicar" },
  { id: "cuidar", label: "Cuidar e ensinar" },
  { id: "negocios", label: "Negócios e liderança" },
  { id: "esportes", label: "Esportes, corpo e natureza" },
];

export const NIVEIS: { id: NivelId; nome: string; min: number; abre: string }[] = [
  { id: 1, nome: "Começando", min: 0, abre: "os mentores profissionais da sua região" },
  { id: 2, nome: "Na Pista", min: 300, abre: "os mentores universitários e técnicos" },
  { id: 3, nome: "Embalado", min: 700, abre: "mais mini-desafios do mentor simulado" },
  { id: 4, nome: "Destravado", min: 1500, abre: "os mentores de alta demanda" },
  { id: 5, nome: "Referência", min: 2500, abre: "o selo Referência" },
];

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
  miniDesafiosPorDia: { base: 1, aPartirDoNivel3: 3 },
  acertosParaAprovar: 3,
  bonusSalva: 0.15,
  bonusQueroConhecer: 0.25,
  swipePorDia: 5,
  topCaminhos: 4,
};

export const PESOS_MATCH = { afinidade: 40, carreira: 25, preferencia: 10, evolucao: 15, engajamento: 10 };

export const LIMIARES = {
  diagnostico: { dominada: 7, emDesenvolvimento: 5, tendencia: 0.5 },
  afinidade: { forte: 65, medio: 35 },
  presenca: 75,
  elegibilidadeFrequencia: 60,
  evasao: { frequenciaBaixa: 75, quedaPontos: 15, inatividadeDias: 14, habilidadesCaindo: 2 },
};

export const SEMESTRE = {
  inicio: "2026-08-03",
  fim: "2026-12-18",
  semanasOcorridas: 8,
  semanasTotal: 16,
};

export const DEMO = { classId: "2A" as const, heroes: { kaua: "s001", bruno: "s002", carla: "s003" } };

export const STORAGE_KEY = "gemini2026:v1";
