# 08 — Plano de Implementação Detalhado (2 horas)

Este documento é o roteiro de execução. Fonte de verdade das regras: `02` (decisões), `07` (regras), `10` (telas), `09` (visual).

## 0. Premissas

- Relógio de **120 minutos**, time de **4–5 pessoas** + **Claude Code** (implementa todo o código, D27).
- Contas Gemini e Vercel já existem (D29). Repositório `alexzjss/gemini2026`, branch padrão `main`.
- Designs em `/design` são a referência visual (D30).
- O app precisa rodar **sem a chave do Gemini** (fallbacks) desde o minuto 45.

## 1. Papéis

| Papel | Quem | Responsabilidades | Entregas |
|---|---|---|---|
| **P1 — Integração** | pessoa 1 | Revisa e mergeia PRs, mantém `main` verde, configura Vercel e env, roda a demo no deploy a cada merge | `main` sempre deployada; checklist de merge |
| **P2 — Conteúdo BNCC** | pessoa 2 | Copia **literalmente** da BNCC (PDF oficial) as 16 habilidades, as competências específicas e os textos de área para `data/corpus/raw/bncc.txt`, com página | `bncc.txt` completo até 0:40 |
| **P3 — Conteúdo Referencial + seed** | pessoa 3 | Copia **literalmente** 8–12 trechos do Referencial de IA na Educação (MEC) para `raw/referencial.txt`; revisa carreiras, cenários, mentores e frases gerados por Claude (linguagem, estereótipos, coerência) | `referencial.txt` até 0:40; revisão do seed até 0:50 |
| **P4 — QA visual e acessibilidade** | pessoa 4 | Compara cada tela com `/design` (mobile 390 e desktop 1440), testa teclado, contraste, leitor de tela básico, celular real | Lista de ajustes por tela (issue/comentário no PR) |
| **P5 — Pitch e demo** | pessoa 5 (ou P4 acumula) | Ensaia o roteiro de `03`, cronometra, escreve as falas, prepara o plano B (vídeo/prints) | Roteiro final + gravação de backup até 1:50 |
| **Claude Code** | — | Implementa todas as frentes em branches `feat/*`, abre PRs pequenos, escreve testes de domínio e scripts | PRs F1–F9 |

## 2. Fluxo de Git (D28)

- Branches: `feat/fundacao`, `feat/dominio`, `feat/ia-rag`, `feat/seed`, `feat/aluno-base`, `feat/aluno-fluxos`, `feat/aluno-match-chat`, `feat/professor`, `feat/conteudo` (P2/P3 commitam os `.txt` aqui), `fix/*` para ajustes de QA.
- Cada PR: descrição curta + checklist de aceite da frente + screenshot (quando tem UI). P1 mergeia com **squash**.
- Regra de ouro: só mergear se `npm run build` e `npm test` passam (P1 confere o check da Vercel).
- Merges previstos: **0:20, 0:45, 1:10, 1:30, 1:45, 1:55** (congelamento).
- Conflitos: arquivos compartilhados (`lib/types.ts`, `lib/config.ts`, `theme.ts`) só mudam na `feat/fundacao`; depois disso, mudanças nesses arquivos vão em PR próprio e pequeno.

## 3. Cronograma

```
0:00 ─ F1 Fundação ──────┐
0:00 ─ Conteúdo (P2,P3) ─┼───────────────┐
0:20 ── merge F1 ────────┘               │
0:20 ─ F2 Domínio + testes ──┐           │
0:20 ─ F3 Seed ──────────────┤           │
0:20 ─ F4 IA/RAG/rotas ──────┤           │
0:45 ── merge F2 F3 F4 ──────┘           │
0:40 ─────────────── corpus pronto ──────┘ → npm run corpus && npm run embed (F4b)
0:45 ─ F5 Aluno base (shell, início, perfil, missões) ─┐
0:45 ─ F8 Professor (mapa, alertas, plano) ────────────┤
1:10 ── merge F5 F8 ───────────────────────────────────┘
1:10 ─ F6 Aluno fluxos (galera, resultado, carreiras, quiz) ─┐
1:10 ─ F7 Match Day + mentor simulado ───────────────────────┤
1:30 ── merge F6 F7 ─────────────────────────────────────────┘
1:30 ─ F9 Fallbacks reais + polimento + QA ── 1:45 merge
1:45 ─ Ensaio completo no deploy (2x) ── 1:55 congelamento ── 2:00 fim
```

Claude executa frentes paralelas com subagentes em worktrees separados (uma frente por worktree/branch). P1 mergeia na ordem acima.

---

## 4. Frentes e tarefas

Formato: **ID — tarefa** · arquivos · aceite.

### F1 — Fundação (0:00–0:20) · `feat/fundacao`

- **F1.1 — Criar o projeto.** `npx create-next-app@15 app-tmp --ts --app --eslint --no-tailwind --no-src-dir --import-alias "@/*"` e mover o conteúdo para a raiz (a raiz já tem `docs/` e `design/`, e o create-next-app recusa diretório não vazio); remover boilerplate. · `package.json`, `app/*` · `npm run dev` abre página em branco.
- **F1.2 — Dependências.** `@mui/material @mui/icons-material @emotion/react @emotion/styled @mui/material-nextjs @mui/x-charts framer-motion canvas-confetti @google/genai zod`; dev: `vitest tsx @types/canvas-confetti`. Scripts: `dev`, `build`, `start`, `lint`, `test` (`vitest run`), `seed`, `corpus`, `embed`, `fallbacks`. · `package.json`.
- **F1.3 — Tema MUI.** Tokens de `09` em `lib/theme.ts`: `palette` (primary = blue, secondary = lime, text.primary = ink, background.default = paper), `typography` (h1–h4 Bricolage, body Inter, overline 12/700/0.08em), `shape.borderRadius = 20`, overrides de `Button` (pill, borda 2px, sombra sólida, `min-height` 48/56), `Card/Paper` (variants `outlined`, `ink`, `highlight`), `Chip`, `LinearProgress`, `BottomNavigation`, `ToggleButton`, `TextField`, `Dialog`, foco visível. · `lib/theme.ts`, `components/ThemeRegistry.tsx` (`AppRouterCacheProvider` + `ThemeProvider` + `CssBaseline`) · página de teste com botão/card/chip igual ao design.
- **F1.4 — Fontes.** `next/font/google` Bricolage Grotesque (600, 800) e Inter (400–700) com `variable`; tema lê as CSS vars. · `app/layout.tsx`.
- **F1.5 — Tipos e config.** `lib/types.ts` (cópia de `05`), `lib/config.ts` (`APP_NAME`, `NIVEIS`, `PONTOS`, `LIMITES`, `PESOS_MATCH`, `LIMIARES` de diagnóstico/evasão/afinidade, `SEMESTRE` com datas, `DEMO`). · compila em strict.
- **F1.6 — Store.** `lib/store/local.ts` (load/save/reset com try/catch, chave `gemini2026:v1`, migração por `version`), `AppStore.tsx` (Context + reducer com todas as ações de `04`, ainda com corpo mínimo), `seed.ts` (imports tipados; JSONs vazios provisórios). · `useAppStore()` funciona; reset limpa.
- **F1.7 — Shells vazios.** `StudentShell`, `TeacherShell`, `DemoBar`, `OfflineBadge`, `FullscreenFlow` com navegação funcionando entre rotas placeholder de `03`. · navegar por todas as rotas sem erro.
- **F1.8 — Deploy.** P1 conecta Vercel, cadastra env (`GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_EMBED_MODEL`, `NEXT_PUBLIC_DEMO_MODE=1`), confirma preview do PR. · URL pública abre.

### F2 — Domínio + testes (0:20–0:45) · `feat/dominio`

Funções puras, sem React, sem I/O. Cada arquivo com teste em `lib/domain/__tests__/`.

| Arquivo | Funções | Testes obrigatórios |
|---|---|---|
| `diagnostico.ts` | `nivelPorMedia`, `tendencia`, `progresso`, `skillStatuses(reportCard, overrides)` | 4,9→defasagem, 5,0→em_desenv., 7,0→dominada; tendência ±0,5; override prevalece |
| `afinidades.ts` | `perfil(respostas, cenarios)`, `rotulo(v)`, `top(perfil, n)`, `fraseTitulo(perfil, frases)` | normalização 0–100; rótulos 65/35; frase do par analisar+esportes |
| `carreiras.ts` | `rankCarreiras(perfil, careers, swipe)`, `filaSwipe`, `combina(perfil, career)`, `ondeAEscolaAparece(career, skills)` | bônus salva/quero; passada vai pro fim e não some; nenhuma carreira removida por nota |
| `pontos.ts` | `podeGanhar(evento, historico)`, `pontuar(evento)`, `totalPontos(seed, eventos)` | limites diários/únicos; nota não gera ponto |
| `niveis.ts` | `nivelPorPontos`, `faltam`, `progressoNivel`, `abreNoNivel` | 299→1, 300→2, 700→3, 1.500→4, 2.500→5; 1.240 → "1.240/1.500", faltam 260 |
| `missoes.ts` | `missaoDoDia(view)`, `sugestoes(view)` | Kauã → EM13MAT316 + EM13MAT310 + EM13CNT301 |
| `match.ts` | `elegivel(snapshot)`, `scoreMentor(snapshot, mentor)`, `escolherMentor(snapshot, mentors)`, `simularSemestre(student, eventos)` | candidatos respeitam nível; empate; Kauã do roteiro → mentor do clube; simular semestre do Kauã = +90 |
| `evasao.ts` | `sinais(student, skills, local)`, `status(sinais, alerta)` | cada sinal isolado; "Conversei" → acompanhando; sinal novo reabre |
| `turma.ts` | `heatmap`, `defasagemPorSkill`, `topInteresses`, `resumo`, `matches` | 2A → EM13MAT316 70%; top interesses futebol/games/empreendedorismo |

Aceite F2: `npm test` verde com ≥ 35 casos; cenário "roteiro do Kauã" ponta a ponta (1.240 → 1.520, nível 4, match com o clube) num teste de integração do domínio.

### F3 — Seed (0:20–0:45) · `feat/seed`

- **F3.1** `skills.json` (16, `descricaoJovem` dos designs quando houver: EM13MAT316 "Estatística: média, moda, mediana e desvio", EM13MAT310 "Problemas de contagem e combinações", EM13LGG701 "Usar tecnologia digital pra se expressar e produzir", EM13LGG303 "Debater e defender um ponto de vista com argumento", EM13CHS101 "Comparar fontes e narrativas diferentes sobre um fato", EM13CNT301 "Levantar hipóteses e testar com dados").
- **F3.2** `scenarios.json`: 10 `galera` (incluir o g07 do design "O grêmio quer fazer o interclasse…"; cobrir todos os eixos ≥ 5 vezes; situações de escola, bairro, internet, fim de semana) + 3 `semana`.
- **F3.3** `frases.json`: 15 frases (todos os pares de eixos).
- **F3.4** `careers.json`: 15 carreiras de `05` com raio-x, `escola`, `comoChegar` (textos do design para as 3 primeiras), `diaACor`, `tags`, `interesseQuiz`.
- **F3.5** `mentors.json`: 12 de `05` (inclui "R" — analista de desempenho de clube da região, nível 1, `careerIds` com analista de dados esportivos; cientista de dados Big Tech, nível 4), bios ilustrativas, `disponibilidade` com 3 horários.
- **F3.6** `missoes.json`: título por habilidade (EM13MAT316 "Quem é o artilheiro de verdade? Média, moda e mediana no interclasse", 8 min; EM13MAT310 "Quantos uniformes dá pra montar?"…).
- **F3.7** `school.json`, `classes.json`, `teacher.json`.
- **F3.8** `scripts/gerar-seed.ts`: heróis fixos (`05`) + 27 alunos gerados (mulberry32(2026)), 6 avaliações cada, frequências, `galeraSeed` para não-heróis; **validações**: 2A EM13MAT316 = 7/10 defasagem; top interesses 2A; 3 alertas em 2A; Kauã/Bruno/Carla com pontos e níveis de `05`; match esperado do Kauã. Falha com mensagem clara se alguma meta não bater.
- Aceite F3: `npm run seed` gera `students.json` e `report-cards.json` determinísticos (mesmo hash a cada execução); P3 revisa textos até 0:50.

### F4 — IA, RAG e rotas (0:20–0:45) · `feat/ia-rag`

- **F4.1** `lib/ai/gemini.ts` (`generateJson`, `withTimeout`, sem chave → fallback).
- **F4.2** `lib/ai/schemas.ts`: `responseSchema` + zod para Diagnóstico, Galera, Quiz, MentorChatReply, MatchText, LessonPlanAI.
- **F4.3** `lib/ai/prompts/*.ts`: funções `build{Rota}Prompt(input, contexto)` com os textos de `06`.
- **F4.4** `lib/rag/retriever.ts` + `lib/fallbacks.ts` (`getFallback(rota, chaves[])` tenta em ordem até `default`).
- **F4.5** 6 rotas em `app/api/*/route.ts`: zod na entrada (400), `export const runtime = "nodejs"`, `maxDuration = 30`, resposta `{ data, source }`.
- **F4.6** Fallbacks `default` escritos à mão para todas as rotas (os específicos vêm em F9).
- **F4.7** `scripts/montar-corpus.ts` e `scripts/embed-corpus.ts`.
- **F4b (0:40–0:50)** Quando P2/P3 entregarem os `.txt`: `npm run corpus && npm run embed`, commit de `data/corpus/*.json` e `corpus.embeddings.json`.
- Aceite F4: com chave, `curl` em cada rota devolve `source: "ai"` e JSON válido; sem chave, `source: "fallback"`; `/api/plano-aula` devolve citações cujo `trecho` é idêntico ao chunk.

### F5 — Aluno base (0:45–1:10) · `feat/aluno-base`

- **F5.1** `components/ui/*`: InkCard, LimeCard, PillButton, PointsPill (+ SparkIcon), BnccChip, SegmentedProgress, LevelBar, AffinityBar, OptionCard, Avatar, LockedMentor, Toast de pontos.
- **F5.2** Selectors `useStudentView` (compõe seed + local + domain).
- **F5.3** Landing/login (tela 1) e Consentimento (tela 2) + guardas do StudentShell.
- **F5.4** StudentShell completo (header, BottomNav, Sidebar desktop).
- **F5.5** Início (tela 3) com LevelCard, DailyMissionCard, GaleraResumeCard/WeeklyChallengeCard, MatchDayCard, carreiras (desktop).
- **F5.6** Perfil/Ficha (tela 12) + resumo IA (`/api/diagnostico`, cache).
- **F5.7** Missões (tela 10) com PointsTable e MentorTiers.
- Aceite F5: Kauã entra, consente e vê Início/Perfil/Missões idênticos aos designs (P4 compara em 390 e 1440).

### F6 — Aluno fluxos (1:10–1:30) · `feat/aluno-fluxos`

- **F6.1** Da Galera (tela 4) com retomada, teclado, painel ao vivo (desktop).
- **F6.2** Resultado (tela 5) + `/api/galera`.
- **F6.3** Desafio da semana (tela 6).
- **F6.4** Swipe de carreiras (tela 7) com framer-motion `drag="x"` + botões + teclado.
- **F6.5** Detalhe da carreira (tela 8) com MentorList e preferência.
- **F6.6** Quiz (tela 11) + `/api/missao` + `finishMission` (pontos, subida de nível, toast).
- Aceite F6: roteiro passos 4–9 de `03` funciona com e sem chave.

### F7 — Match Day + mentor simulado (1:10–1:30) · `feat/aluno-match-chat`

- **F7.1** Mentor simulado (tela 9) + `/api/mentor-simulado` + mini-desafio (+20).
- **F7.2** `simulateSemester` (DemoBar e MatchDayCard).
- **F7.3** Match Day (tela 13): estados não-elegível/revelação; contagem; flip; confete; fatores; perguntas; reduced-motion.
- **F7.4** ScheduleDialog e confirmação; card do Início atualizado.
- Aceite F7: roteiro passos 8 e 13; Kauã chega a 1.520, nível 4, match com o clube.

### F8 — Professor (0:45–1:10, ajustes até 1:30) · `feat/professor`

- **F8.1** TeacherShell + seletor de turma + `useClassView`.
- **F8.2** SummaryCards + SkillHeatmap (tabela acessível, células por nível, clique no aluno) + coluna "% defasagem" + botão "Gerar plano" com Popover.
- **F8.3** DefasagemBars (`@mui/x-charts`) na aba "Resumo" (mobile).
- **F8.4** AttentionList + ConversationDialog.
- **F8.5** Ficha individual (tela 15).
- **F8.6** Editor de plano (tela 16): seções, etapas dinâmicas, soma de minutos, CitationsPanel, EthicsSeal, salvar/regenerar/aprovar.
- **F8.7** Lista de planos (tela 17).
- Aceite F8: roteiro passos 10–12; célula do Kauã muda ao vivo após a missão (mesmo navegador).

### F9 — Fallbacks reais, polimento e QA (1:30–1:45) · `feat/polimento`

- **F9.1** `npm run fallbacks`: grava respostas reais para todas as chaves de `06` (roteiro completo) e commita.
- **F9.2** Aplicar a lista de ajustes do P4 (espaçamentos, tamanhos, cores, foco).
- **F9.3** Estados vazios e de erro revisados (sem stack trace visível; tudo com texto amigável).
- **F9.4** Teste com `GEMINI_API_KEY` removida no preview: roteiro inteiro sem quebrar, badge "IA offline" aparece.
- **F9.5** Lighthouse mobile rápido no Início (meta: Acessibilidade ≥ 90, sem erro de console).

## 5. Checkpoints de verificação

| Hora | Verificação (P1 + P4) | Se falhar |
|---|---|---|
| 0:20 | Deploy da fundação abre; tema bate com os designs (botão, card, chip) | Claude corrige antes de abrir F2–F4 |
| 0:45 | `npm test` verde; rotas respondem com e sem chave; seed validado | Prioriza domínio; rotas ficam só com fallback |
| 0:50 | Corpus completo e embeddings commitados | Retriever por palavra-chave (corte 4) |
| 1:10 | Kauã navega Início/Perfil/Missões; professor vê mapa 2A com 70% | Aplica cortes 1–2 |
| 1:30 | Roteiro inteiro roda no preview | Aplica cortes 3–5 |
| 1:45 | 1º ensaio cronometrado no deploy de produção | Ajustes só de texto |
| 1:55 | Congelamento; 2º ensaio; gravação de backup | Demo pela gravação |

## 6. Testes

- **Automatizados (Vitest, D59):** só `lib/domain`, casos listados em F2, rodando no build da Vercel (`"build": "vitest run && next build"`).
- **Manuais (P4), por tela:** layout 390×844 e 1440×1000 contra o design; teclado (Tab/Enter/setas); foco visível; zoom 200% sem quebrar; `prefers-reduced-motion`.
- **Roteiro (P5):** 3 execuções completas: com chave, sem chave, e após "Resetar dados".

## 7. Checklist final (definição de pronto)

- [ ] Roteiro de `03` roda inteiro em ≤ 5 min no celular e no desktop.
- [ ] Sem chave do Gemini, nenhuma tela quebra; badge "IA offline" aparece.
- [ ] Nenhum texto sugere que o aluno "não pode" seguir uma carreira; nenhuma carreira some por nota.
- [ ] Sinais de evasão aparecem **só** no professor; não vão para a IA.
- [ ] Citações do plano mostram texto oficial literal com fonte.
- [ ] Mentor simulado sempre identificado como IA; não pede dados pessoais.
- [ ] Kauã: 1.240 → 1.520, nível 3 → 4, match com a analista do clube, agendamento confirmado.
- [ ] Bruno nível 4 com notas baixas; Carla nível 1 com notas altas.
- [ ] Professor: 2A mostra EM13MAT316 70%; célula do Kauã muda ao vivo; "Conversei" funciona; plano aprovado aparece em Planos.
- [ ] "Resetar dados" volta tudo ao estado inicial.
- [ ] `npm test` e `npm run build` verdes; deploy de produção atualizado.

## 8. Riscos e mitigação

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Gemini lento/fora na demo | média | alto | Fallbacks reais (F9.1), `iaCache`, timeout 15s, demo offline testada |
| MUI brigando com o visual neo-brutalista | média | médio | Overrides centralizados no tema (F1.3) validados no checkpoint 0:20; `sx` pontual |
| Corpus atrasar | média | médio | Retriever por palavra-chave + chunks mínimos das 6 habilidades da demo |
| Conflitos de merge | média | médio | Arquivos compartilhados só na fundação; PRs pequenos; P1 dono do merge |
| Hidratação SSR × localStorage | baixa | médio | Páginas client + skeleton até carregar (`04`) |
| Embedding model descontinuado | baixa | baixo | Trocar `GEMINI_EMBED_MODEL` para `gemini-embedding-001` |
| Seed incoerente com o roteiro | baixa | alto | Validações do `gerar-seed.ts` + teste de integração do Kauã |

## 9. Cortes (na ordem, se o tempo apertar)

1. Ficha individual do aluno no professor (tela 15).
2. Lista de planos (tela 17) — o editor mostra o estado aprovado.
3. Desafio da semana (tela 6).
4. Embeddings → retriever só por código/palavra-chave.
5. Mentor simulado com IA → só o roteiro do fallback.
6. Resumo IA da ficha → texto do fallback.
7. Painel "Até agora você curte" no desktop.

**Nunca cortar:** consentimento, "carreiras nunca bloqueadas", Da Galera + resultado, missão com subida de nível, Match Day, mapa 2A, plano com citações + aprovação, fallback offline.

## 10. Comandos de referência

```bash
npm install
```
```bash
npm run seed
```
```bash
npm run corpus && npm run embed
```
```bash
npm test
```
```bash
npm run dev
```
```bash
npm run fallbacks
```

## 11. Divisão entre cinco agentes

Divisão por **posse de arquivos**, não por tela: cada agente é dono exclusivo de um conjunto de pastas. O que é compartilhado (tipos, tema, assinaturas) sai primeiro como contrato e só muda por pedido ao dono.

### Donos

| Agente | Frentes | Pastas exclusivas |
|---|---|---|
| **1. Fundação e integração** | F1, F5.1 (componentes base), F7 (Match Day e mentor simulado), F9.2–F9.5 | `lib/types.ts`, `lib/config.ts`, `lib/theme.ts`, `lib/store/` (exceto `selectors.ts`), `components/ui/`, `components/shell/`, `app/layout.tsx`, `app/aluno/match/`, `app/aluno/carreiras/[id]/mentor-simulado/` |
| **2. Domínio e seed** | F2, F3, selectors | `lib/domain/`, `lib/store/selectors.ts`, `data/seed/`, `scripts/gerar-seed.ts` |
| **3. IA e RAG** | F4, F4b, F9.1 | `lib/ai/`, `lib/rag/`, `lib/fallbacks.ts`, `app/api/`, `data/corpus/`, `data/fallbacks/`, `scripts/montar-corpus.ts`, `scripts/embed-corpus.ts`, `scripts/gerar-fallbacks.ts` |
| **4. UI do aluno** | F5.2–F5.7, F6 | `components/aluno/`, `app/page.tsx`, `app/aluno/` (exceto as rotas do Agente 1) |
| **5. UI do professor** | F8 | `components/professor/`, `app/professor/` |

O F7 fica com o Agente 1 porque ele termina a fundação cedo e tem folga entre 0:45 e 1:30.

### Contratos

| Contrato | Dono | Prazo | Conteúdo |
|---|---|---|---|
| 1 | Agente 1 | 0:05 | `lib/types.ts` e `lib/config.ts` completos (de `05` e `07`) |
| 2 | Agente 2 | 0:20 | `lib/domain/*` com as assinaturas finais e retornos fixos do Kauã |
| 3 | Agente 3 | 0:25 | Rotas `app/api/*` com os contratos de `04`, devolvendo o fallback `default` |

As telas (Agentes 4 e 5) são montadas sobre os stubs; a troca pela implementação real não muda a tela.

### Sequência

| Hora | Agente 1 | Agente 2 | Agente 3 | Agentes 4 e 5 |
|---|---|---|---|---|
| 0:00–0:05 | Projeto + contrato 1 | Lê `05`, `07` | Lê `04`, `06` | Leem `09`, `10`, `design/` |
| 0:05–0:20 | Tema, store, shells, deploy | Contrato 2 | Cliente Gemini; contrato 3 até 0:25 | Telas com dados fixos |
| 0:20–0:45 | `components/ui/` | Regras reais + testes, seed + validações | Prompts, schemas, retriever | Ligam as telas aos stubs |
| 0:45–1:10 | Merges, depois Match Day | Selectors `useStudentView`/`useClassView` | Corpus + embeddings (quando o time entregar) | 4: Início, Perfil, Missões · 5: mapa e alertas |
| 1:10–1:30 | Mentor simulado, agendamento | Ajustes de regra | Rotas reais, citações | 4: Da Galera, swipe, quiz · 5: editor e lista de planos |
| 1:30–1:45 | Polimento, QA | Teste de integração do roteiro do Kauã | `npm run fallbacks` | Correções de QA |

### Regras
1. Cada agente trabalha numa worktree própria, no branch `feat/<frente>` da seção 2.
2. Mudança em arquivo de outro dono: pedir ao dono, nunca editar.
3. Tipos, config e tema mudam só por pedido ao Agente 1, em PR pequeno e isolado.
4. PR só com `npm run build` e `npm test` verdes. P1 mergeia na ordem 1 → 2 e 3 → 4 e 5 → 1 (F7) → polimento.
5. Todos recebem `CLAUDE.md` e os docs da sua frente; Agentes 4 e 5 recebem também `09`, `10` e `design/`.

### Riscos da divisão
- **Agente 2 é o caminho crítico:** se os selectors atrasarem, as telas ficam nos stubs. O contrato 2 sai até 0:20 mesmo incompleto.
- **Agente 3 depende do time humano** para os textos oficiais; até lá, corpus mínimo das 6 habilidades da demo e busca por palavra-chave.
- **Agente 4 tem a maior carga:** se apertar, o desafio da semana passa para o Agente 1 (corte 3).
