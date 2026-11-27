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

## Rodada 2 — detalhamento (após análise dos designs em `/design`)

Quando houver conflito, **as decisões desta rodada substituem as anteriores**. Itens substituídos: D02 (detalhado), D05 (Tailwind sai), D10 (mentor simulado entra como chat), D13 (tiers viram níveis), D15 (heróis), D24 (tabela de pontos).

| # | Tema | Decisão |
|---|---|---|
| D27 | Time | 4–5 pessoas. **Claude Code implementa o código**; o time cuida de conteúdo (corpus BNCC/Referencial literal), revisão do seed, QA visual, ensaio da demo e pitch |
| D28 | Git | Um branch por frente de trabalho (`feat/<frente>`), PR curto, merge em `main` a cada bloco de ~30 min; `main` sempre com deploy verde na Vercel |
| D29 | Contas | Chave Gemini e conta Vercel já existem |
| D30 | Visual | **Sistema visual dos designs** (`docs/09-design-system.md`): creme `#F4F1EA`, tinta `#16150F`, azul `#3045F0`, lima `#CFF24A`, bordas 2px, sombra sólida 4px, Bricolage Grotesque + Inter. Substitui "cores do Google/Gemini" |
| D31 | Componentes | **Material UI** como base acessível, com **tema totalmente customizado** para reproduzir os designs. **Sem Tailwind.** Estilos via `theme` + `sx`/`styled` |
| D32 | Professor | Mesma marca, versão mais sóbria e densa (desktop first, responsiva) |
| D33 | Tema | Só modo claro |
| D34 | Libs | `@mui/x-charts` (barras no professor), `framer-motion` (transições, swipe, revelação), `canvas-confetti` (Match Day) |
| D35 | Da Galera | **10 cenários**, 1 por tela, opções A–D, botão "Próximo cenário" (habilitado após escolher), progresso salvo para continuar depois, painel lateral "Até agora você curte" no desktop |
| D36 | Resultado | **Barras por eixo** (forte/médio/leve) + **frase-título** gerada pelo perfil + 4 caminhos (chips) + 1 habilidade para destravar + aviso "seu boletim mostra de onde você parte" |
| D37 | Eixos | 6 eixos: Organizar e analisar · Tecnologia e games · Criar e comunicar · Cuidar e ensinar · Negócios e liderança · Esportes, corpo e natureza |
| D38 | Carreiras | **15 carreiras**. Tela de **swipe** (Passar / Salvar / Quero conhecer), com "raio-x de um dia" e "onde a escola aparece". O swipe **só explora**; salvas e "quero conhecer" pesam no Match Day |
| D39 | Quero conhecer | Salva com peso maior, abre o detalhe da carreira, +10 pts uma vez por carreira |
| D40 | Salário | Campo "Quanto ganha" **escondido no MVP** (roadmap: Novo CAGED/RAIS) |
| D41 | Mentores no detalhe | Lista de mentores da área: disponíveis no seu nível mostram "Quero no meu Match Day" (preferência); bloqueados aparecem com "abre no nível N" |
| D42 | Vitrine | Mentores de níveis acima aparecem com avatar/nome ocultos e cargo visível + cadeado |
| D43 | Mentor simulado | Tela dos designs (M-Live) vira **chat de texto** com o Gemini no papel do profissional, com mini-desafio BNCC (+20, 1x por sessão). Rótulo: "Mentor simulado por IA". Voz fica no roadmap |
| D44 | Níveis | **5 níveis**: 1 Começando (0), 2 Na Pista (300), 3 Embalado (700), 4 Destravado (1.500), 5 Referência (2.500). Mentores: nível 1 profissionais da região, nível 2 universitários e técnicos, nível 4 alta demanda (Big Tech, medicina, executivos) |
| D45 | Pontos | +50 terminar Da Galera · +30 missão concluída · +40 missão aprovada (evoluir) · +40 extra quando a habilidade sobe de nível · +15 semana com presença em dia · +10 explorar carreira (Quero conhecer) · +10 desafio da semana · +20 mini-desafio do mentor simulado · nota alta +0 |
| D46 | Missões | Sistema sugere 3 (defasagem ligada às carreiras salvas primeiro). "Missão do dia" = a nº 1. Interesse do quiz automático pela carreira nº 1, com chip para trocar |
| D47 | Quiz | 4 questões, **explicação após cada questão**. Sem botão de dica, sem refazer na hora, sem cronômetro |
| D48 | Desafio da semana | Card no Início com 3 cenários extras que refinam o perfil (+10) |
| D49 | Navegação aluno | Barra inferior (mobile) / barra superior (desktop): **Início · Carreiras · Missões · Perfil**. Match Day = card no Início + tela cheia de revelação. Quiz, Da Galera e mentor simulado em tela cheia |
| D50 | Match Day | Contagem "3, 2, 1" → card vira → confete; mostra mentor, porquê (fatores) e 3 perguntas; botão **"Agendar conversa"** com 3 horários fictícios e confirmação |
| D51 | Professor × match | Professor só visualiza quem deu match e com qual área |
| D52 | Mapa da turma | 4 cards-resumo + **heatmap habilidades (linhas) × alunos (colunas)**, clicável; coluna "% defasagem" e botão **"Gerar plano"** em cada linha, já com o interesse nº 1 da turma |
| D53 | Editor de plano | Campos editáveis por seção; citações fixas em painel lateral; aprovar |
| D54 | Alerta | Professor marca **"Conversei"** + nota; alerta passa a "acompanhando" |
| D55 | Professor entra | Professor demo com as 3 turmas, abre direto no **2º EM A** com seletor de turma |
| D56 | Sincronia | Painel do professor lê seed + `localStorage` → o progresso do Kauã aparece **ao vivo** no mesmo navegador |
| D57 | Seed | Script determinístico com semente fixa gera alunos e boletins; heróis, mentores, carreiras e cenários escritos à mão |
| D58 | Corpus | O time extrai os trechos literais da BNCC e do Referencial; Claude estrutura em chunks |
| D59 | Testes | Vitest só em `lib/domain` |
| D60 | Heróis | **Kauã** (2º EM A, `2026001`, protagonista, 1.240 pts, nível 3) · **Bruno** (2º EM A, `2026002`, notas baixas e muito esforço, nível 4) · **Carla** (3º EM A, `2026003`, notas altas e pouco engajamento, nível 1). Turma da demo: **2º EM A** |
| D61 | Telas sem design | Login, consentimento, quiz, Match Day, mentor simulado (texto) e todo o professor são desenhados por Claude seguindo `09-design-system.md` |
| D62 | Nome | Placeholder `[nome do app]` dos designs = constante `APP_NAME` ("Gemini2026") |
