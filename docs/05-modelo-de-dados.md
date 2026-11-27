# 05 — Modelo de Dados

Todos os tipos vivem em `lib/types.ts`. Dados estáticos em `data/seed/*.json`; estado mutável do usuário demo em `localStorage` (chave `gemini2026:v1`).

## Tipos

```ts
export type Serie = 1 | 2 | 3;
export type Area = "MAT" | "LGG" | "CNT" | "CHS";          // Matemática, Linguagens, Ciências da Natureza, Ciências Humanas
export type SkillLevel = "defasagem" | "em_desenvolvimento" | "dominada";
export type Tier = "bronze" | "prata" | "ouro";

export type AffinityAxis =
  | "tech"        // tecnologia, games, programação
  | "dados"       // números, lógica, análise
  | "criativo"    // arte, design, música, audiovisual
  | "pessoas"     // cuidar, ensinar, saúde, social
  | "negocios"    // empreender, vender, liderar
  | "natureza";   // ciência, meio ambiente, esportes/corpo
export type AffinityProfile = Record<AffinityAxis, number>; // 0–100

export interface School { id: string; nome: string; cidade: string; uf: string; }

export interface ClassGroup {
  id: string;            // "1A"
  schoolId: string;
  serie: Serie;
  nome: string;          // "1º EM A"
  professor: string;     // nome fictício
}

export interface Student {
  id: string;            // "s001"
  matricula: string;     // "2026001"
  nome: string;          // fictício
  classId: string;
  serie: Serie;
  hero?: boolean;        // alunos do roteiro de demo
  // histórico pré-carregado (simula o semestre até hoje)
  frequencia: number[];          // % por semana, últimas 8 semanas
  ultimoAcessoDiasAtras: number;
  vocacionalSeed?: AffinityProfile;  // alunos não-heróis já vêm com perfil
  pontosSeed: number;
  eventosSeed: PointEvent[];
}

export interface Skill {
  code: string;          // "EM13MAT316"
  area: Area;
  descricaoCurta: string; // para UI do aluno, linguagem jovem
  descricaoOficial: string; // texto da BNCC (corpus)
  componente: string;    // "Matemática", "Língua Portuguesa"...
}

// Boletim detalhado: cada avaliação já mapeada a códigos BNCC
export interface Assessment {
  id: string;
  componente: string;    // "Matemática"
  titulo: string;        // "Prova 1 – Estatística"
  bimestre: 1 | 2;
  nota: number;          // 0–10
  skillCodes: string[];
}
export interface ReportCard { studentId: string; avaliacoes: Assessment[]; }

export interface SkillStatus {
  code: string;
  level: SkillLevel;
  media: number;         // média das avaliações ligadas
  tendencia: "subindo" | "estavel" | "caindo"; // bimestre 2 vs 1
  evoluiuNoSemestre: boolean; // subiu de nível via missões
}

export interface Career {
  id: string;            // "analista-dados-esportivos"
  nome: string;
  emoji: string;
  descricaoJovem: string;
  affinity: AffinityProfile;
  skills: string[];      // códigos BNCC relevantes
  tags: string[];        // "futebol", "games"... (interesses agregáveis)
}

export interface Mentor {
  id: string;
  nome: string;          // fictício
  cargo: string;
  organizacao: string;   // fictícia ou genérica ("Big Tech", "Clube de futebol")
  tier: Tier;
  careerIds: string[];
  affinity: AffinityProfile;
  bio: string;
  vagasSemestre: number;
}

export interface Scenario {
  id: string;
  titulo: string;        // "Sábado livre. Você..."
  contexto: string;
  opcoes: { id: string; emoji: string; texto: string; pesos: Partial<AffinityProfile> }[];
}

export type PointEventType =
  | "vocacional_concluido" | "desafio_concluido" | "missao_concluida"
  | "habilidade_evoluiu_defasagem" | "habilidade_evoluiu_desenvolvimento"
  | "frequencia_semanal";
export interface PointEvent { type: PointEventType; pontos: number; at: string; ref?: string; }

export interface Quiz {
  skillCode: string;
  interesse: string;
  titulo: string;
  questoes: {
    id: string;
    enunciado: string;
    alternativas: string[];   // 4
    correta: number;          // índice
    dica: string;             // mostrada antes de responder, opcional
    explicacao: string;       // após responder
  }[];
}

export interface LessonPlan {
  id: string;
  classId: string;
  skillCode: string;
  interesse: string;
  titulo: string;
  objetivo: string;
  duracaoMin: number;          // 50
  etapas: { nome: string; minutos: number; descricao: string; citacoes: number[] }[];
  avaliacao: string;
  adaptacoes: { nivel: SkillLevel; sugestao: string }[];
  citacoes: { n: number; chunkId: string; ref: string; trecho: string }[];
  seloEtico: { criterio: string; atendido: boolean; comoAtende: string }[];
  status: "rascunho" | "aprovado";
  source: "ai" | "fallback";
  aprovadoEm?: string;
}

// enviado ao /api/match
export interface StudentSnapshot {
  studentId: string;
  serie: Serie;
  affinity: AffinityProfile;
  topCareerIds: string[];
  skills: SkillStatus[];
  pontos: number;
  tier: Tier;
  frequenciaMedia: number;
  missoesConcluidas: number;
  vocacionalConcluido: boolean;
}

// localStorage
export interface LocalState {
  sessao?: { role: "aluno" | "professor"; studentId?: string };
  porAluno: Record<string, {
    consentAt?: string;
    vocacional?: { respostas: Record<string, string>; profile: AffinityProfile; topCareerIds: string[]; textoIA?: unknown };
    eventos: PointEvent[];
    skillOverrides: Record<string, SkillLevel>;   // níveis após missões
    missoes: { skillCode: string; acertos: number; total: number; at: string }[];
    diagnosticoIA?: { resumo: string; destaques: string[]; proximosPassos: string[] };
    match?: unknown;
  }>;
  planos: LessonPlan[];
  semestreSimulado: boolean;
}
```

## Especificação do seed

| Arquivo | Conteúdo |
|---|---|
| `school.json` | 1 escola fictícia ("EE Profª Maria de Lourdes", cidade genérica) |
| `classes.json` | `1A` (1º EM), `2A` (2º EM), `3A` (3º EM) |
| `students.json` | 30 alunos (10/turma). Heróis: `s001` Ana (1A, `2026001`), `s002` Bruno (1A, `2026002`), `s003` Carla (3A, `2026003`) |
| `report-cards.json` | 4–6 avaliações por aluno, 2 bimestres, mapeadas a códigos BNCC |
| `skills.json` | ~16 habilidades BNCC EM (4 por área), ver abaixo |
| `careers.json` | ~15 carreiras com `affinity`, `skills`, `tags` |
| `mentors.json` | 12 mentores: 5 Bronze, 4 Prata, 3 Ouro |
| `scenarios.json` | 8 micro-cenários |

### Habilidades sugeridas para o corpus/seed

> ⚠️ Os textos em `descricaoOficial` e no corpus RAG **devem ser copiados literalmente da BNCC oficial** (basenacionalcomum.mec.gov.br). Os códigos abaixo são reais; confira cada texto.

- **MAT:** EM13MAT101, EM13MAT102, EM13MAT302, EM13MAT316 (medidas de tendência central e dispersão)
- **LGG:** EM13LGG101, EM13LGG301, EM13LP01, EM13LP12
- **CNT:** EM13CNT101, EM13CNT204, EM13CNT301, EM13CNT303
- **CHS:** EM13CHS101, EM13CHS401, EM13CHS403, EM13CHS501

### Distribuição desejada (para a demo)

- Turma `1A`: ~65% dos alunos em defasagem em **EM13MAT316**; interesses dominantes **games, futebol, empreendedorismo**; 3 alunos com sinais de atenção (inclui Bruno).
- **Ana (s001):** EM13MAT316 em defasagem, LGG dominadas, frequência ~90%, `pontosSeed` 240 (para cruzar Prata ao fazer vocacional + 1 missão com evolução). Interesses resultantes: dados + natureza (esportes) + tech.
- **Bruno (s002):** médias baixas, mas `eventosSeed` com várias evoluções e missões → ~720 pontos (Ouro). Frequência caiu nas semanas 3–4 e voltou (alerta já resolvido/“em recuperação”) — mostra que esforço vence nota.
- **Carla (s003):** médias ≥ 8,5, `pontosSeed` 90, `ultimoAcessoDiasAtras` 20 → Bronze e alerta de inatividade.

### Exemplo de cenário

```json
{
  "id": "c1",
  "titulo": "Sábado livre 🌞",
  "contexto": "Sem compromisso nenhum. O que você faz?",
  "opcoes": [
    { "id": "a", "emoji": "🎮", "texto": "Maratona de jogo online com a galera", "pesos": { "tech": 3, "pessoas": 1 } },
    { "id": "b", "emoji": "⚽", "texto": "Futebol na quadra e depois ver os lances", "pesos": { "natureza": 2, "dados": 1, "pessoas": 1 } },
    { "id": "c", "emoji": "🎨", "texto": "Editar um vídeo ou desenhar", "pesos": { "criativo": 3 } },
    { "id": "d", "emoji": "💸", "texto": "Vender umas coisas na feira/no Insta", "pesos": { "negocios": 3, "pessoas": 1 } }
  ]
}
```
