import type {
  AffinityProfile,
  ClassGroup,
  NivelId,
  Serie,
  Skill,
  SkillLevel,
  SkillStatus,
  Teacher,
} from "@/lib/types";

/**
 * Modelos de tela da UI do professor.
 *
 * Os tipos de domínio vêm de `lib/types.ts` (docs/05). Estes aqui descrevem o
 * que cada tela consome; quem os monta é `dados/fonte.ts` (o adaptador).
 */

export type StatusAtencao = "ok" | "atencao" | "acompanhando";

export interface AtencaoAluno {
  status: StatusAtencao;
  /** Textos de docs/07 §7, já prontos para exibir. */
  motivos: string[];
  conversa?: { conversouEm: string; nota: string };
}

export interface AlunoTurma {
  id: string;
  nome: string;
  inicial: string;
  nivel: NivelId;
  pontos: number;
  /** Nível por código BNCC; ausente = sem dado no boletim. */
  skills: Record<string, SkillLevel | undefined>;
  atencao: AtencaoAluno;
  galeraConcluido: boolean;
}

export interface Distribuicao {
  defasagem: number;
  em_desenvolvimento: number;
  dominada: number;
}

export interface LinhaHeatmap {
  skill: Skill;
  /** % da turma (entre quem tem dado) em defasagem, 0–100. */
  pctDefasagem: number;
  nComDado: number;
  distribuicao: Distribuicao;
}

export interface InteresseTurma {
  tag: string;
  peso: number;
}

export interface MatchTurma {
  studentId: string;
  nome: string;
  area: string;
}

export interface TurmaView {
  turma: ClassGroup;
  turmas: ClassGroup[];
  professor: Teacher;
  /** Ordem alfabética (colunas do heatmap). */
  alunos: AlunoTurma[];
  /** Ordenadas por % de defasagem, decrescente (linhas do heatmap). */
  linhas: LinhaHeatmap[];
  topInteresses: InteresseTurma[];
  resumo: {
    maiorDefasagem?: LinhaHeatmap;
    nAtencao: number;
    pctGalera: number;
  };
  matches: MatchTurma[];
}

export interface FichaAlunoView {
  aluno: AlunoTurma;
  turma: ClassGroup;
  serie: Serie;
  frequenciaMedia: number;
  skills: (SkillStatus & { skill: Skill })[];
  perfil?: AffinityProfile;
  carreiras: { nome: string; tipo: "quero_conhecer" | "salva" }[];
  match?: { mentor: string; area: string; agendadoPara?: string };
  missoes: { skillCode: string; acertos: number; total: number; at: string }[];
}

/** Parâmetros que o mapa passa para gerar um plano (vira o corpo do POST). */
export interface PedidoPlano {
  classId: string;
  skillCode: string;
  interesse: string;
  distribuicao: Distribuicao;
  nAlunos: number;
  notasProfessor?: string;
}
