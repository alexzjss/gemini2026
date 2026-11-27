# 02 — Registro de Decisões (ADR)

Decisões tomadas na sessão de definição do MVP. Mudar qualquer uma exige atualizar este arquivo.

| # | Tema | Decisão | Motivo / consequência |
|---|---|---|---|
| D01 | Contexto | Hackathon/edital com demo; **2h de desenvolvimento**; MVP básico | Tudo que é integração externa é mock; prioridade é a demo não quebrar |
| D02 | Plataforma | **Web**: interface do aluno + interface do professor na mesma base | Um único app Next.js com dois "modos" por perfil |
| D03 | IA | **100% Google**: Gemini API via `@google/genai` | Coerente com o edital |
| D04 | Modelos | `gemini-2.5-flash` para geração; `text-embedding-004` para embeddings (configuráveis por env) | Rápido e barato. Se o modelo de embedding estiver descontinuado, trocar por `gemini-embedding-001` via env |
| D05 | Stack | **Next.js (App Router) + TypeScript + Tailwind**, API routes no servidor | Um projeto, deploy trivial, chave do Gemini nunca vai ao cliente |
| D06 | Dados | **Seed JSON** versionado + **`localStorage`** para progresso do aluno demo | Zero setup de banco |
| D07 | RAG | **Corpus curado** (trechos BNCC EM + Referencial de IA) em JSON, embeddings **pré-calculados** por script, busca por cosseno em memória | RAG real e citável sem infra; fallback por palavra-chave |
| D08 | Auth | **Código de matrícula fake** para aluno; botão "Entrar como professor (demo)" | Sem Auth real |
| D09 | Escopo | Entram os 4 módulos: Boletim→BNCC, Teste vocacional, Pontos+Match Day, Painel professor+plano RAG | Ver `03-escopo-mvp.md` |
| D10 | Gemini Live | **Fora do MVP** (apenas roadmap na arquitetura) | Risco alto para 2h |
| D11 | Match Day | Botão **"Simular fim do semestre"** (modo demo) roda o algoritmo e revela o mentor | Não dá para esperar o calendário real |
| D12 | Algoritmo de match | **Score determinístico** + **explicação redigida pelo Gemini** | Auditável e alinhado ao Referencial |
| D13 | Tiers | **3 tiers por pontos**: Bronze (0+), Prata (300+), Ouro (700+) | Mentores de alta demanda no Ouro |
| D14 | Missões | **Quiz curto (3–5 questões) gerado por IA** sobre habilidade defasada, contextualizado no interesse do aluno | Fallback com quizzes pré-gerados no seed |
| D15 | Seed | 1 escola, 3 turmas (1º/2º/3º EM), ~30 alunos, 3 alunos "heróis", ~12 mentores | Volume suficiente para o mapa da turma parecer real |
| D16 | Tom | Jovem e direto para aluno; técnico para professor | — |
| D17 | Nome | Placeholder **"Gemini2026"** | Constante única `APP_NAME` para trocar depois |
| D18 | Diagnóstico | **Boletim mock já detalhado por avaliação → código BNCC**; regra calcula domínio; Gemini só escreve o resumo | Confiável, sem alucinação de habilidades |
| D19 | Plano de aula | Saída = **roteiro estruturado + citações BNCC/Referencial + selo ético** | Atividade gamificada separada e exportar PDF ficam fora |
| D20 | Acessibilidade | PT-BR, mobile-first, WCAG AA básico, leve | Público com celular básico |
| D21 | Fallback | Toda chamada de IA tem **resposta cacheada** no seed; badge "modo offline" | Demo nunca quebra |
| D22 | Deploy | **Vercel** | Push → URL pública |
| D23 | Evasão | **Alerta com sinais simples e transparentes**, só para o professor | Ver regras em `07` |
| D24 | Pontos | **Evolução pesa mais** que nota absoluta | Ver tabela em `07` |
| D25 | Ética (aluno) | **Carreiras nunca bloqueadas** + **tela de consentimento** na entrada | "Por que estou vendo isso" e selo "IA ajuda, você pensa" ficam fora do MVP (o match ainda mostra justificativa) |
| D26 | Próximo passo | Nesta etapa entregar **somente documentação**; implementação depois da revisão do time | — |
