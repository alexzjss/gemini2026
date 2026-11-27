# 05 — Modelo de Dados

Tipos em `lib/types.ts`. Dados estáticos em `data/seed/*.json` (gerados/escritos uma vez e versionados). Estado mutável do navegador demo em `localStorage`, chave `gemini2026:v1`.

## Tipos

```ts
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
```

## Arquivos do seed (`data/seed/`)

| Arquivo | Origem | Conteúdo |
|---|---|---|
| `school.json` | à mão | "EE Profª Maria de Lourdes Ramos", cidade e UF genéricas |
| `classes.json` | à mão | `1A`, `2A`, `3A` |
| `teacher.json` | à mão | "Prof.ª Helena Duarte", Matemática, 3 turmas |
| `skills.json` | à mão | 16 habilidades (abaixo) |
| `scenarios.json` | à mão | 10 cenários `galera` + 3 `semana` |
| `frases.json` | à mão | 15 frases-título (pares de eixos) |
| `careers.json` | à mão | 15 carreiras |
| `mentors.json` | à mão | 12 mentores (5 região · 4 universitários/técnicos · 3 alta demanda) |
| `missoes.json` | à mão | 1 título por habilidade |
| `students.json` | **script** + heróis à mão | 30 alunos (10 por turma) |
| `report-cards.json` | **script** + heróis à mão | 6 avaliações por aluno (3 componentes × 2 bimestres) |

Script: `scripts/gerar-seed.ts` (`npm run seed`), PRNG com semente fixa (`mulberry32(2026)`), nomes de uma lista fixa de 40 nomes brasileiros comuns. Gera respeitando as metas abaixo e **valida** no fim (falha se as metas não forem atingidas).

### Habilidades (16)

> Códigos reais da BNCC; a `descricaoJovem` é nossa. O texto oficial fica no corpus RAG e deve ser **copiado literalmente** do documento da BNCC pelo time.

| Área | Códigos |
|---|---|
| MAT | EM13MAT101, EM13MAT302, EM13MAT310, EM13MAT316 |
| LGG | EM13LGG101, EM13LGG303, EM13LGG701, EM13LP01 |
| CNT | EM13CNT101, EM13CNT204, EM13CNT301, EM13CNT303 |
| CHS | EM13CHS101, EM13CHS401, EM13CHS403, EM13CHS501 |

### Carreiras (15)
Analista de dados esportivos · Gestor(a) de equipe de e-sports · Técnico(a) em logística · Desenvolvedor(a) de games · Desenvolvedor(a) de software · Designer gráfico/UX · Jornalista esportivo(a) · Criador(a) de conteúdo/audiovisual · Enfermeiro(a) · Professor(a) · Psicólogo(a) · Empreendedor(a) de negócio local · Técnico(a) em administração/marketing digital · Educador(a) físico(a)/preparador(a) físico(a) · Técnico(a) em meio ambiente.

### Mentores (12)
- **Região (nível 1):** analista de desempenho de clube da região · dona de loja que vende pelo Instagram · enfermeiro de UBS · técnico de logística de centro de distribuição · professora de educação física.
- **Universitários e técnicos (nível 2):** estudante de ciência de dados (universidade pública) · técnico em informática que desenvolve jogos indie · estudante de jornalismo · técnica em meio ambiente.
- **Alta demanda (nível 4):** cientista de dados em Big Tech · médica especialista em medicina esportiva · executiva de marketing de empresa de games.

### Metas de distribuição (validadas pelo script)

**Turma 2A (demo):**
- EM13MAT316: **7 de 10 alunos (70%) em defasagem** (Kauã não está entre eles: ele está em desenvolvimento). O pitch usa o número exibido na tela.
- Top interesses: futebol, games, empreendedorismo.
- 3 alunos com sinal de atenção: Bruno (queda de frequência nas semanas 3–4, já recuperando — frequência baixa nas últimas 4 semanas ainda) + 2 gerados (1 inatividade, 1 notas em queda).

**Kauã (`s001`, 2A, `2026001`, inicial "K")**
- EM13MAT316 média 5,8 → `em_desenvolvimento`, tendência subindo (bimestre 1: 5,2 · bimestre 2: 6,4). EM13MAT310 média 4,6 → `defasagem`. EM13LGG701 e EM13LGG303 ≥ 8 → `dominada`. EM13CHS101 7,8 → `dominada`. EM13CNT301 6,1 → `em_desenvolvimento`.
- `pontosSeed` 1.240, `missoesSeed` 3, `evolucoesSeed` 1 → nível 3 "Embalado", faltam 260 para o 4.
- `galeraParcialSeed`: 6 de 10 cenários respondidos, puxando para `analisar` e `esportes`.
- Frequência semanas 1–8: 92, 88, 95, 90, 85, 93, 90, 91. Projetada 9–16: 90, 88, 92, 90, 70, 72, 90, 88 → exatamente **6 semanas ≥ 75% = +90** no Match Day.
- Fluxo esperado na demo termina em **1.520 pts → nível 4** (ver `07 §6`).
- **Missão do dia = EM13MAT316** (bate com o design): pela regra `missaoDoDia()` de `07 §8`, é a 1ª habilidade não dominada da carreira nº 1 (analista de dados esportivos, `skills: ["EM13MAT316", "EM13MAT310", …]`). As outras 2 sugestões serão EM13MAT310 ("Quantos uniformes dá pra montar?") e EM13CNT301.

**Bruno (`s002`, 2A, `2026002`, inicial "B")**
- Médias 3,5–5,5 na maioria (várias `defasagem`), mas `evolucoesSeed` 5, `missoesSeed` 14, `pontosSeed` 1.580 → **nível 4**. Frequência: 85, 80, 55, 50, 70, 78, 80, 82 → aparece como "atenção" (queda), mostrando que o professor vê e ele está se recuperando.
- Mensagem da demo: nota baixa + esforço = alta demanda liberada.

**Carla (`s003`, 3A, `2026003`, inicial "C")**
- Médias 8,5–9,6 (quase tudo `dominada`), `pontosSeed` 180, `missoesSeed` 0, `ultimoAcessoDiasAtras` 20 → **nível 1** e sinal de inatividade.
- Mensagem: nota alta sozinha não destrava mentores.

### Exemplo de cenário (do design)

```json
{
  "id": "g07", "grupo": "galera", "quando": "Sexta, 19h",
  "enunciado": "O grêmio quer fazer o interclasse e ninguém se mexeu. Você…",
  "opcoes": [
    { "key": "A", "label": "Monto a tabela de jogos e o chaveamento", "pesos": { "analisar": 3, "esportes": 1 } },
    { "key": "B", "label": "Faço a arte e os posts pro Insta do grêmio", "pesos": { "criar": 3, "tech": 1 } },
    { "key": "C", "label": "Vou atrás de patrocínio na lanchonete do bairro", "pesos": { "negocios": 3 } },
    { "key": "D", "label": "Fico de juiz e resolvo as tretas", "pesos": { "cuidar": 2, "esportes": 2 } }
  ]
}
```

### Exemplo de carreira (do design)

```json
{
  "id": "analista-dados-esportivos",
  "nome": "Analista de dados esportivos",
  "affinity": { "analisar": 95, "tech": 55, "criar": 20, "cuidar": 15, "negocios": 30, "esportes": 90 },
  "combinaCom": { "analisar": "números", "esportes": "futebol", "tech": "tecnologia" },
  "tags": ["futebol", "dados"],
  "interesseQuiz": "futebol",
  "diaACor": "blue",
  "raioX": [
    { "t": "9h", "what": "Puxa os números do jogo de ontem" },
    { "t": "14h", "what": "Monta o relatório pro técnico" },
    { "t": "17h", "what": "Mostra quem cansa mais no 2º tempo" }
  ],
  "skills": ["EM13MAT316", "EM13MAT310", "EM13MAT101"],
  "escola": { "EM13MAT316": "média e desvio padrão pra comparar jogadores." },
  "comoChegar": "Curso técnico em informática ou graduação em estatística, ciência de dados ou educação física com foco em desempenho."
}
```

## Chaves de `iaCache`

`diagnostico`, `galera:resultado`, `missao:{code}:{interesse}:{yyyy-mm-dd}`, `match`. O cache evita chamadas repetidas e deixa a demo instantânea na segunda vez.
