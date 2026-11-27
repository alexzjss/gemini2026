// Contrato 1 (dono: Agente 1). Cópia literal de docs/05. Provisório até a feat/fundacao.
export type Serie = 1 | 2 | 3;
export type Area = "MAT" | "LGG" | "CNT" | "CHS";
export type SkillLevel = "defasagem" | "em_desenvolvimento" | "dominada";
export type NivelId = 1 | 2 | 3 | 4 | 5;

export type AffinityAxis = "analisar" | "tech" | "criar" | "cuidar" | "negocios" | "esportes";
export type AffinityProfile = Record<AffinityAxis, number>;          // 0–100

/* ---------- Escola ---------- */
export interface School { id: string; nome: string; cidade: string; uf: string; }

export interface ClassGroup {
  id: "1A" | "2A" | "3A";
  schoolId: string;
  serie: Serie;
  nome: string;                 // "2º EM A"
}

export interface Teacher { id: "prof-demo"; nome: string; disciplina: string; classIds: ClassGroup["id"][]; }

/* ---------- Aluno ---------- */
export interface Student {
  id: string;                   // "s001"
  matricula: string;            // "2026001"
  nome: string;                 // fictício
  inicial: string;              // "K" (avatar)
  classId: ClassGroup["id"];
  serie: Serie;
  hero?: "kaua" | "bruno" | "carla";
  frequencia: number[];         // % por semana, semanas 1–8 (já ocorridas)
  frequenciaProjetada: number[];// % semanas 9–16 (usado no "simular fim do semestre")
  ultimoAcessoDiasAtras: number;
  pontosSeed: number;
  missoesSeed: number;          // missões concluídas antes de hoje
  evolucoesSeed: number;        // habilidades que já subiram de nível no semestre
  galeraSeed?: {                // alunos não-heróis já vêm com o teste feito
    perfil: AffinityProfile;
    queroConhecer: string[];
    salvas: string[];
  };
  galeraParcialSeed?: Record<string, string>; // Kauã: 6 de 10 respondidos
}

/* ---------- BNCC ---------- */
export interface Skill {
  code: string;                 // "EM13MAT316"
  area: Area;
  areaLabel: "Matemática" | "Linguagens" | "Natureza" | "Humanas";
  descricaoJovem: string;       // "Estatística: média, moda, mediana e desvio"
  chunkId: string;              // id do chunk oficial no corpus
}

export interface Assessment {
  id: string;
  componente: string;           // "Matemática"
  titulo: string;               // "Prova 1 – Estatística"
  bimestre: 1 | 2;
  nota: number;                 // 0–10, 1 casa decimal
  skillCodes: string[];
}
export interface ReportCard { studentId: string; avaliacoes: Assessment[]; }

export interface SkillStatus {
  code: string;
  level: SkillLevel;
  media: number;
  tendencia: "subindo" | "estavel" | "caindo";
  progresso: number;            // 0–100
  subiuEm?: string;             // ISO, quando evoluiu via missão
}

/* ---------- Da Galera ---------- */
export interface Scenario {
  id: string;                   // "g01".."g10"; "w01".."w03" = desafio da semana
  grupo: "galera" | "semana";
  quando: string;               // chip: "Sexta, 19h"
  enunciado: string;            // "O grêmio quer fazer o interclasse e ninguém se mexeu. Você…"
  opcoes: { key: "A" | "B" | "C" | "D"; label: string; pesos: Partial<AffinityProfile> }[];
}

/* ---------- Carreiras ---------- */
export interface Career {
  id: string;                   // "analista-dados-esportivos"
  nome: string;                 // "Analista de dados esportivos"
  affinity: AffinityProfile;
  combinaCom: Partial<Record<AffinityAxis, string>>; // { analisar: "números", esportes: "futebol" }
  tags: string[];               // interesses agregáveis: ["futebol", "dados"]
  interesseQuiz: string;        // contexto padrão das missões: "futebol"
  diaACor: "blue" | "lime" | "ink";
  raioX: { t: string; what: string }[];          // 3 itens
  skills: string[];             // códigos BNCC relevantes, em ordem de importância
  escola: Record<string, string>;                // code → "média e desvio padrão pra comparar jogadores."
  comoChegar: string;           // "Técnico em informática ou graduação em estatística/ciência de dados…"
}

/* ---------- Mentores ---------- */
export interface Mentor {
  id: string;
  nome: string;                 // fictício
  inicial: string;
  cargo: string;                // "Analista de desempenho"
  organizacao: string;          // "Clube da região" | "Big Tech" (genérico)
  categoria: "regiao" | "universitario_tecnico" | "alta_demanda";
  nivelMinimo: 1 | 2 | 4;
  careerIds: string[];
  affinity: AffinityProfile;
  bio: string;
  disponibilidade: string[];    // ["Ter 14h", "Qui 10h", "Sáb 9h"]
  vagasSemestre: number;
}

/* ---------- Missões ---------- */
export interface MissionDef { skillCode: string; titulo: string; minutos: number; }

export interface Quiz {
  skillCode: string;
  interesse: string;
  titulo: string;
  questoes: {
    id: string;
    enunciado: string;
    alternativas: [string, string, string, string];
    correta: 0 | 1 | 2 | 3;
    explicacao: string;         // mostrada após responder
  }[];                          // exatamente 4
}

/* ---------- Pontos ---------- */
export type PointEventType =
  | "galera_concluido" | "desafio_semana" | "carreira_explorada"
  | "missao_concluida" | "missao_aprovada" | "habilidade_subiu"
  | "presenca_semana" | "mini_desafio_mentor";
export interface PointEvent { type: PointEventType; pontos: number; at: string; ref?: string; }

/* ---------- Mentor simulado ---------- */
export interface ChatTurn { role: "aluno" | "mentor"; texto: string; at: string; }
export interface MentorChatReply {
  fala: string;                                     // ≤ 400 caracteres
  miniDesafio?: { skillCode: string; enunciado: string };
  desafioResolvido?: boolean;                       // avalia a última resposta do aluno
}

/* ---------- Match ---------- */
export interface MatchFactors { afinidade: number; carreira: number; preferencia: number; evolucao: number; engajamento: number; }
export interface MatchResult {
  eligible: boolean;
  faltaPara?: string[];
  mentorId?: string;
  score?: number;
  fatores?: MatchFactors;
  explicacao?: string;          // IA
  perguntasSugeridas?: string[];// IA, 3
  source: "ai" | "fallback";
  agendadoPara?: string;
}

export interface StudentSnapshot {
  studentId: string;
  serie: Serie;
  nivel: NivelId;
  perfil: AffinityProfile;
  top4: string[];
  salvas: string[];
  queroConhecer: string[];
  preferenciasMentor: string[];
  skills: SkillStatus[];
  evolucoes: number;
  missoes: number;
  frequenciaMedia: number;
  galeraConcluido: boolean;
}

/* ---------- Plano de aula ---------- */
export interface LessonPlan {
  id: string;
  classId: string;
  skillCode: string;
  interesse: string;
  titulo: string;
  objetivo: string;
  duracaoMin: 50;
  etapas: { nome: string; minutos: number; descricao: string; citacoes: number[] }[]; // 3–5
  avaliacao: string;
  adaptacoes: { nivel: SkillLevel; sugestao: string }[];  // 3
  citacoes: { n: number; chunkId: string; ref: string; fonte: string; trecho: string }[];
  seloEtico: { criterio: string; atendido: boolean; comoAtende: string; citacao?: number }[];
  status: "rascunho" | "aprovado";
  source: "ai" | "fallback";
  criadoEm: string;
  aprovadoEm?: string;
}

/* ---------- Estado local ---------- */
export interface StudentLocal {
  consentAt?: string;
  ultimoAcesso?: string;
  galera: { respostas: Record<string, string>; concluidoEm?: string };
  semana: { respostas: Record<string, string>; concluidoEm?: string };
  swipe: { salvas: string[]; queroConhecer: string[]; passadas: string[] };
  preferenciasMentor: string[];
  eventos: PointEvent[];
  skillOverrides: Record<string, { level: SkillLevel; at: string }>;
  missoes: { skillCode: string; acertos: number; total: 4; at: string }[];
  chats: Record<string, ChatTurn[]>;               // por careerId
  match?: MatchResult;
  iaCache: Record<string, unknown>;                // respostas de IA por chave
}

export interface LocalState {
  version: 1;
  sessao?: { role: "aluno"; studentId: string } | { role: "professor" };
  porAluno: Record<string, StudentLocal>;
  planos: LessonPlan[];
  alertas: Record<string, { conversouEm: string; nota: string }>; // por studentId
  semestreSimulado: boolean;
}
