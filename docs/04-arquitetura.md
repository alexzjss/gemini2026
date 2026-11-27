# 04 — Arquitetura

## Visão geral

```
┌──────────────────────────── Navegador ────────────────────────────┐
│  Next.js (React, Tailwind)                                         │
│  ├─ UI Aluno  (/aluno/*)                                           │
│  ├─ UI Professor (/professor/*)                                    │
│  └─ store/  ── seed (import estático) + overrides no localStorage  │
│              (consentimento, respostas, pontos, missões, planos)   │
└───────────────┬────────────────────────────────────────────────────┘
                │ fetch JSON (POST)
┌───────────────▼──────────── Servidor (Vercel, Node runtime) ───────┐
│  app/api/*  (route handlers)                                       │
│  ├─ /api/diagnostico     resumo da ficha BNCC                      │
│  ├─ /api/vocacional      perfil + carreiras                        │
│  ├─ /api/missao          gera quiz                                 │
│  ├─ /api/match           score determinístico + explicação IA      │
│  └─ /api/plano-aula      RAG + geração do roteiro                  │
│                                                                    │
│  lib/domain/  regras puras (diagnóstico, pontos, tiers, match,     │
│               evasão) — sem IA, testáveis, usadas no cliente E     │
│               no servidor                                          │
│  lib/ai/      gemini.ts (cliente + JSON mode + timeout + fallback) │
│               prompts/*.ts                                         │
│  lib/rag/     retriever.ts (cosseno em memória + keyword fallback) │
│  data/        seed/*.json, corpus/*.json, corpus.embeddings.json,  │
│               fallbacks/*.json                                     │
└───────────────┬────────────────────────────────────────────────────┘
                │ HTTPS (GEMINI_API_KEY só no servidor)
        ┌───────▼────────┐
        │  Gemini API    │  gemini-2.5-flash · text-embedding-004
        └────────────────┘
```

**Regra central:** lógica de decisão (domínio, pontos, tier, match, evasão) é **código determinístico** em `lib/domain`. O Gemini **só gera linguagem** (resumos, quizzes, explicações, plano de aula). Isso torna o sistema auditável e a demo resiliente.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript strict |
| UI | Tailwind CSS; componentes próprios simples (sem lib pesada); ícones `lucide-react` |
| Validação | `zod` (schemas de entrada das rotas e de saída do Gemini) |
| IA | `@google/genai` — `responseMimeType: "application/json"` + `responseSchema` |
| Estado | React Context + hook `useAppStore` sobre `localStorage` |
| Deploy | Vercel; env `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_EMBED_MODEL`, `NEXT_PUBLIC_DEMO_MODE` |

## Estrutura de pastas

```
/
├─ app/
│  ├─ page.tsx                          # landing
│  ├─ layout.tsx                        # AppProvider, topbar, badge offline
│  ├─ aluno/
│  │  ├─ consentimento/page.tsx
│  │  ├─ page.tsx                       # dashboard
│  │  ├─ ficha/page.tsx
│  │  ├─ vocacional/page.tsx
│  │  ├─ missao/[skillCode]/page.tsx
│  │  └─ match/page.tsx
│  ├─ professor/
│  │  ├─ page.tsx
│  │  ├─ turma/[classId]/page.tsx
│  │  ├─ turma/[classId]/aluno/[studentId]/page.tsx
│  │  ├─ plano/page.tsx
│  │  └─ planos/page.tsx
│  └─ api/
│     ├─ diagnostico/route.ts
│     ├─ vocacional/route.ts
│     ├─ missao/route.ts
│     ├─ match/route.ts
│     └─ plano-aula/route.ts
├─ components/  (ui/, aluno/, professor/)
├─ lib/
│  ├─ config.ts            # APP_NAME, limiares, pesos
│  ├─ types.ts             # ver 05-modelo-de-dados.md
│  ├─ domain/
│  │  ├─ diagnostico.ts    # notas → SkillStatus
│  │  ├─ afinidades.ts     # respostas → AffinityProfile, ranking de carreiras
│  │  ├─ pontos.ts         # eventos → pontos, tier
│  │  ├─ match.ts          # score aluno×mentor, elegibilidade
│  │  ├─ evasao.ts         # sinais de atenção
│  │  └─ turma.ts          # agregados da turma
│  ├─ ai/
│  │  ├─ gemini.ts         # generateJson<T>(prompt, schema, fallbackKey)
│  │  └─ prompts/          # diagnostico.ts, vocacional.ts, missao.ts, match.ts, plano.ts
│  ├─ rag/
│  │  └─ retriever.ts      # retrieve(query, {k, sources})
│  └─ store/
│     ├─ seed.ts           # importa data/seed/*.json
│     └─ useAppStore.tsx   # merge seed + localStorage
├─ data/
│  ├─ seed/   school.json, classes.json, students.json, report-cards.json,
│  │          mentors.json, careers.json, scenarios.json, skills.json
│  ├─ corpus/ bncc-em.json, referencial-ia.json
│  ├─ corpus.embeddings.json   # gerado por script, versionado
│  └─ fallbacks/ diagnostico.json, vocacional.json, missao.json, match.json, plano.json
└─ scripts/
   └─ embed-corpus.ts      # npm run embed
```

## Contratos das API routes

Todas: `POST`, JSON, validação `zod`, resposta `{ data, source: "ai" | "fallback" }`. Timeout de 15 s no Gemini → fallback.

| Rota | Entrada | Saída (`data`) |
|---|---|---|
| `/api/diagnostico` | `{ studentId, skills: SkillStatus[] }` | `{ resumo: string, destaques: string[], proximosPassos: string[] }` |
| `/api/vocacional` | `{ studentId, profile: AffinityProfile, topCareers: CareerId[], skills: SkillStatus[] }` | `{ carreiras: [{ careerId, porqueCombina, habilidadesParaDestravar: [{code, motivo}] }] }` |
| `/api/missao` | `{ skillCode, interesse: string, serie: 1\|2\|3 }` | `Quiz` (ver 05) |
| `/api/match` | `{ student: StudentSnapshot }` | `{ eligible, match?: { mentorId, score, fatores }, explicacao, perguntasSugeridas: string[], faltaPara?: string[] }` |
| `/api/plano-aula` | `{ classId, skillCode, interesse, notasProfessor? }` | `LessonPlan` (com `citacoes[]`) |

Observação: `/api/match` executa `lib/domain/match.ts` no servidor (fonte de verdade), e só então pede ao Gemini a explicação. O cliente envia o snapshot do aluno porque o progresso vive no `localStorage`.

## Fluxos principais

### Diagnóstico
`students.json` + `report-cards.json` → `domain/diagnostico.ts` calcula `SkillStatus[]` (no cliente) → `/api/diagnostico` gera resumo → cache no `localStorage` por aluno.

### Vocacional
Respostas → `domain/afinidades.ts` (soma de pesos por eixo, normaliza 0–100) → ranking de carreiras por cosseno com `career.affinity` → top 3 → `/api/vocacional` redige "por que combina" e cruza com `career.skills` vs ficha → "habilidades para destravar". **Nenhuma carreira filtrada por nota.**

### Missão
`/api/missao` → `rag.retrieve(skillCode)` traz descrição oficial da habilidade → Gemini gera quiz contextualizado → cliente corrige localmente → `domain/pontos.ts` registra eventos → `domain/diagnostico.ts` aplica `levelUp`.

### Match Day
Botão demo → monta `StudentSnapshot` → `/api/match` → elegibilidade → score com cada mentor do tier ≤ tier do aluno → maior score → Gemini explica → tela de celebração.

### Plano de aula (RAG)
1. Query = `"{skill.code} {skill.descricao} {interesse} ensino médio"`.
2. `retrieve(query, { k: 4, sources: ["bncc"] })` + `retrieve("uso ético de IA, pensamento crítico, autonomia docente", { k: 2, sources: ["referencial"] })`.
3. Prompt com trechos numerados `[1]..[6]`, instrução de usar **apenas** esses trechos e citar pelos números.
4. Gemini → `LessonPlan` JSON; servidor valida que todo `citacoes[].chunkId` existe nos trechos recuperados (remove os inválidos).
5. Professor edita/aprova no cliente.

## RAG — detalhes

- **Chunks**: `{ id, source: "bncc" | "referencial", ref: "EM13MAT316" | "Princípio X", titulo, texto }`, 1 chunk por habilidade BNCC (+ competência específica da área) e 1 por princípio/trecho do Referencial.
- **Embeddings**: `scripts/embed-corpus.ts` chama `embedContent` para cada chunk e grava `data/corpus.embeddings.json` (`{ id, vector: number[] }[]`). Executado uma vez e versionado → runtime só embeda a query.
- **Busca**: cosseno em memória (< 200 chunks, trivial). Se o embedding da query falhar → fallback por sobreposição de palavras-chave + match exato de código BNCC.
- **Atalho**: se a query contém um código BNCC presente no corpus, esse chunk entra sempre em 1º lugar.

## Resiliência da demo

- `generateJson` tenta Gemini (timeout 15 s, 1 retry) → valida com zod → em falha devolve `data/fallbacks/<rota>.json[chave]` com `source: "fallback"`; a UI mostra o badge "IA offline".
- Fallbacks são pré-gerados para os 3 heróis e para as combinações habilidade × interesse do roteiro de demo.
- Botão "Resetar dados demo" limpa o `localStorage`.

## Segurança e privacidade

- `GEMINI_API_KEY` só no servidor; nenhuma chamada de IA no cliente.
- Dados 100% fictícios; nenhum PII real.
- Prompts nunca enviam nome do aluno ao Gemini — apenas `studentId` pseudônimo, série, habilidades e afinidades.
- Risco de evasão não é enviado ao Gemini nem exibido ao aluno.

## Roadmap técnico pós-MVP

Firestore + Firebase Auth (Google Workspace for Education) · integração com sistemas estaduais de boletim · Vertex AI Search para RAG com documentos completos · **Gemini Live API** para o simulador de carreira por voz · interface do mentor e agenda · painel do gestor · Cloud Run.
