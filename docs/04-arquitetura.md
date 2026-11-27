# 04 — Arquitetura

## Visão geral

```
┌──────────────────────────────── Navegador ─────────────────────────────────┐
│ Next.js App Router (React 19) + MUI (tema custom) + framer-motion           │
│  ├─ /aluno/*      UI do aluno (mobile-first; sidebar ≥ 900px)              │
│  ├─ /professor/*  UI do professor (desktop-first)                          │
│  └─ lib/store     seed (import estático) + LocalState (localStorage)       │
│                   └─ selectors usam lib/domain (regras puras)              │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │ fetch POST JSON
┌──────────────▼──────────────── Servidor (Vercel, runtime Node) ────────────┐
│ app/api/*                                                                  │
│  ├─ diagnostico      resumo da ficha (texto)                               │
│  ├─ galera           textos do resultado e "porque combina"                │
│  ├─ missao           quiz contextualizado (RAG: chunk da habilidade)        │
│  ├─ mentor-simulado  turno de chat + mini-desafio (RAG: chunk da habilidade)│
│  ├─ match            score determinístico + explicação/perguntas (IA)      │
│  └─ plano-aula       RAG BNCC + Referencial → LessonPlan                   │
│ lib/domain  regras puras (mesmo código no cliente e no servidor)           │
│ lib/ai      gemini.ts (JSON mode, timeout, retry, zod, fallback)           │
│ lib/rag     retriever.ts (cosseno em memória + keyword)                    │
│ data/       seed, corpus, embeddings, fallbacks                            │
└──────────────┬─────────────────────────────────────────────────────────────┘
               │ HTTPS — GEMINI_API_KEY só no servidor
        ┌──────▼───────┐
        │ Gemini API   │ gemini-2.5-flash · text-embedding-004
        └──────────────┘
```

**Princípio:** decisões (nível de habilidade, pontos, níveis, ranking de carreiras, missão do dia, match, evasão) são **código determinístico** em `lib/domain`. O Gemini só **gera linguagem**: resumos, quizzes, falas do mentor simulado, justificativa do match e plano de aula.

## Stack e dependências

| Pacote | Uso |
|---|---|
| `next@15`, `react@19`, `typescript` (strict) | App Router, rotas de servidor |
| `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `@mui/material-nextjs` | Componentes + `AppRouterCacheProvider` (SSR do Emotion) |
| `@mui/x-charts` | Barras do professor (defasagem por habilidade) |
| `framer-motion` | Transições, swipe (`drag="x"`), revelação do Match Day |
| `canvas-confetti` | Confete do Match Day |
| `@google/genai` | Gemini (geração JSON + embeddings) |
| `zod` | Validação de entradas e saídas de IA |
| `vitest` (dev) | Testes de `lib/domain` |
| `tsx` (dev) | Rodar `scripts/*.ts` |

Fontes: `next/font/google` (Bricolage Grotesque 600/800, Inter 400–700) expostas como CSS vars e usadas no tema.

**Sem Tailwind** (D31). Estilos: `theme.ts` (palette, typography, shape, components overrides) + `sx` pontual + `styled` para componentes do design system.

## Estrutura de pastas

```
/
├─ app/
│  ├─ layout.tsx                    # fontes, ThemeRegistry, AppStoreProvider, DemoBar
│  ├─ page.tsx                      # landing/login
│  ├─ aluno/
│  │  ├─ layout.tsx                 # StudentShell (header + bottom nav / sidebar); guarda: sessão + consentimento
│  │  ├─ page.tsx                   # Início
│  │  ├─ consentimento/page.tsx
│  │  ├─ galera/page.tsx            # fluxo (FullscreenFlow)
│  │  ├─ galera/resultado/page.tsx
│  │  ├─ semana/page.tsx
│  │  ├─ carreiras/page.tsx         # swipe
│  │  ├─ carreiras/[id]/page.tsx
│  │  ├─ carreiras/[id]/mentor-simulado/page.tsx
│  │  ├─ missoes/page.tsx
│  │  ├─ missoes/[code]/page.tsx    # quiz
│  │  ├─ perfil/page.tsx
│  │  └─ match/page.tsx
│  ├─ professor/
│  │  ├─ layout.tsx                 # TeacherShell (sidebar + seletor de turma)
│  │  ├─ page.tsx                   # redirect → /professor/turma/2A
│  │  ├─ turma/[classId]/page.tsx
│  │  ├─ turma/[classId]/aluno/[studentId]/page.tsx
│  │  ├─ plano/[planId]/page.tsx
│  │  └─ planos/page.tsx
│  └─ api/
│     ├─ diagnostico/route.ts
│     ├─ galera/route.ts
│     ├─ missao/route.ts
│     ├─ mentor-simulado/route.ts
│     ├─ match/route.ts
│     └─ plano-aula/route.ts
├─ components/
│  ├─ ui/          # design system: InkCard, LimeCard, PillButton, PointsPill, BnccChip, SegmentedProgress,
│  │               # LevelBar, AffinityBar, OptionCard, SparkIcon, Avatar, Toast (+pts), LockedMentor
│  ├─ shell/       # StudentShell, BottomNav, Sidebar, TeacherShell, DemoBar, OfflineBadge, FullscreenFlow
│  ├─ aluno/       # LevelCard, DailyMissionCard, GaleraResumeCard, WeeklyChallengeCard, MatchDayCard,
│  │               # ScenarioStep, LiveAffinityPanel, CareerSwipeCard, CareerDetail, MentorList,
│  │               # ChatBubble, MiniChallengeChip, QuizQuestion, QuizSummary, SkillRow, PointsTable,
│  │               # MentorTiers, MatchReveal, ScheduleDialog, ConsentSheet
│  └─ professor/   # SummaryCards, SkillHeatmap, DefasagemBars, AttentionList, ConversationDialog,
│                  # StudentProfile, PlanEditor, CitationsPanel, EthicsSeal, PlanList
├─ lib/
│  ├─ config.ts    # APP_NAME, NIVEIS, PONTOS, LIMIARES, PESOS_MATCH, DEMO
│  ├─ types.ts
│  ├─ theme.ts     # tokens de 09-design-system.md
│  ├─ domain/      # diagnostico, afinidades, carreiras, pontos, niveis, missoes, match, evasao, turma
│  │  └─ __tests__/
│  ├─ ai/
│  │  ├─ gemini.ts
│  │  ├─ schemas.ts            # responseSchema + zod por rota
│  │  └─ prompts/              # system.ts, diagnostico.ts, galera.ts, missao.ts, mentor.ts, match.ts, plano.ts
│  ├─ rag/retriever.ts
│  ├─ fallbacks.ts             # getFallback(rota, chave)
│  └─ store/
│     ├─ seed.ts               # importa data/seed/*.json tipado
│     ├─ local.ts              # load/save/reset do LocalState (try/catch)
│     ├─ AppStore.tsx          # Context + reducer + ações
│     └─ selectors.ts          # useStudentView(id), useClassView(classId) — compõem domain
├─ data/
│  ├─ seed/        # school, classes, teacher, skills, scenarios, frases, careers, mentors, missoes, students, report-cards
│  ├─ corpus/      # bncc-em.json, referencial-ia.json  (+ raw/ com os .txt colados pelo time)
│  ├─ corpus.embeddings.json
│  └─ fallbacks/   # diagnostico, galera, missao, mentor, match, plano
├─ scripts/
│  ├─ gerar-seed.ts            # npm run seed
│  ├─ montar-corpus.ts         # npm run corpus  (raw/*.txt → corpus/*.json)
│  ├─ embed-corpus.ts          # npm run embed
│  └─ gerar-fallbacks.ts       # npm run fallbacks (chama as rotas locais e salva)
└─ design/                     # protótipos (referência, não vai para o bundle)
```

## Estado no cliente

- `AppStore` = `useReducer(LocalState)` + persistência em `localStorage` (debounce 200ms, `try/catch`; se indisponível, funciona em memória).
- **Ações:** `login`, `logout`, `consent`, `answerGalera`, `finishGalera`, `answerSemana`, `swipe(pass|save|want)`, `preferMentor`, `finishMission`, `chatTurn`, `awardMiniChallenge`, `simulateSemester`, `setMatch`, `scheduleMatch`, `markConversation`, `savePlan`, `approvePlan`, `cacheAI`, `resetDemo`.
- Cada ação que gera pontos chama `domain/pontos.ts` para validar limites (anti-farm) e emite um toast "+N pts".
- **Selectors** compõem seed + local + domain: `useStudentView(id)` → `{ skills, perfil, nivel, pontos, faltam, top4, fila, missaoDoDia, sugestoes, mentores, elegivel }`; `useClassView(classId)` → `{ heatmap, defasagem, topInteresses, atencao, resumo, matches }`. O professor usa os mesmos selectors → o progresso do Kauã aparece ao vivo.
- Hidratação: páginas do aluno e do professor são client components; o layout mostra um skeleton até o `localStorage` carregar (evita mismatch de SSR).

## Contratos das rotas (`POST`, JSON)

Resposta padrão: `{ data: T, source: "ai" | "fallback" }`. Erro de validação de entrada → 400. Qualquer falha de IA → fallback (nunca 500 na demo).

| Rota | Entrada (zod) | Saída `data` | Fallback key |
|---|---|---|---|
| `/api/diagnostico` | `{ studentId, serie, skills: {code, level, descricaoJovem}[] }` | `{ resumo, destaques[2], proximosPassos[2] }` | `studentId` → `default` |
| `/api/galera` | `{ studentId, perfil, top4: {id,nome,skills}[], destravar: {code, descricaoJovem, status} }` | `{ porQueCombina: Record<careerId,string>, destravarTexto }` | `studentId` → `default` |
| `/api/missao` | `{ skillCode, interesse, serie }` | `Quiz` | `{code}:{interesse}` → `{code}` → `default` |
| `/api/mentor-simulado` | `{ careerId, skillCode, serie, historico: ChatTurn[≤12], desafioAberto?: {skillCode, enunciado} }` | `MentorChatReply` | `careerId:{turno}` → `default` (roteiro de 3 turnos) |
| `/api/match` | `{ snapshot: StudentSnapshot }` | `MatchResult` | `studentId` → `default` |
| `/api/plano-aula` | `{ classId, skillCode, interesse, distribuicao: {defasagem, em_desenvolvimento, dominada}, nAlunos, notasProfessor? }` | `LessonPlan` (status `rascunho`) | `{classId}:{code}:{interesse}` → `default` |

`/api/match` roda `domain/match.ts` no servidor (fonte de verdade) com o snapshot e os mentores do seed; só depois pede ao Gemini a explicação e as perguntas.

## Fluxos (sequência)

**Missão:** Missões → `/aluno/missoes/EM13MAT316` → `iaCache` hit? → senão `POST /api/missao` → `retrieve("EM13MAT316")` → Gemini → zod → Quiz → aluno responde 4 → `finishMission(code, acertos)` → `pontos` (+30, +40 se ≥ 3, +40 se subiu) → `skillOverrides` → toast + resumo → ficha e heatmap do professor atualizados.

**Mentor simulado:** Detalhe da carreira → chat → turno 1 (saudação + rotina) → turno 2 (aluno pergunta) → mentor responde e abre `miniDesafio` → aluno responde → rota devolve `desafioResolvido` → `awardMiniChallenge` (+20, 1x).

**Match Day:** card no Início → "Simular fim do semestre" → `simulateSemester` (presenças 9–16) → `/aluno/match` → monta `StudentSnapshot` → `POST /api/match` → revelação → "Agendar conversa" → `scheduleMatch`.

**Plano:** mapa → "Gerar plano" (linha EM13MAT316, interesse "futebol") → `POST /api/plano-aula` → RAG (4 BNCC + 2 Referencial) → Gemini → pós-processamento de citações → `savePlan` (rascunho) → `/professor/plano/[id]` → edição → `approvePlan`.

## RAG

- **Chunk:** `{ id, source: "bncc" | "referencial", ref, titulo, fonte, texto }`; `fonte` = "BNCC – Ensino Médio, p. X" / "Referencial de IA na Educação (MEC), seção Y".
- **Montagem:** o time cola os textos literais em `data/corpus/raw/*.txt` num formato simples (`### EM13MAT316` + texto); `npm run corpus` converte em JSON.
- **Embeddings:** `npm run embed` (uma vez, versionado).
- **Busca:** (1) códigos BNCC presentes na query entram primeiro; (2) cosseno com o embedding da query, filtrado por `source`; (3) sem embedding → sobreposição de tokens normalizados.
- **Plano:** `k=4` BNCC (habilidade + competência específica + 2 vizinhas) + `k=2` Referencial ("pensamento crítico, autonomia docente, uso ético e transparente de IA, equidade").

## Resiliência

- `generateJson`: timeout 15s (`AbortController`), 1 retry com 500ms, zod; falha → fallback + `source: "fallback"` → `OfflineBadge` acende.
- Sem `GEMINI_API_KEY` → fallback direto (demo roda 100% offline).
- `iaCache` no cliente: 2ª execução é instantânea.
- `npm run fallbacks` grava as respostas reais da IA para o roteiro inteiro (Kauã, Bruno, Carla, EM13MAT316×futebol, plano 2A×EM13MAT316×futebol, chat da analista de dados).

## Segurança e privacidade

- Chave só no servidor; nenhuma chamada de IA no cliente.
- Dados 100% fictícios. Prompts recebem `studentId` pseudônimo, série, habilidades e afinidades — **nunca nome, frequência ou sinais de evasão**.
- Mentor simulado: system prompt proíbe pedir dados pessoais, contato, redes sociais; respostas ≤ 400 caracteres; temas fora da carreira são redirecionados.
- Rotas limitam tamanho de entrada (histórico ≤ 12 turnos, texto ≤ 500 caracteres).

## Deploy

Vercel conectado ao GitHub; `main` → produção, PRs → preview. Env: `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`, `GEMINI_EMBED_MODEL=text-embedding-004`, `NEXT_PUBLIC_DEMO_MODE=1`. `maxDuration` 30s nas rotas de IA.

## Roadmap técnico

Firestore + Firebase Auth (Google for Education) · integração com boletim estadual · Vertex AI Search com documentos completos · **Gemini Live API** no mentor simulado (a tela já está pronta para trocar texto por voz) · interface do mentor real e agenda · painel do gestor · faixa salarial (Novo CAGED/RAIS).
