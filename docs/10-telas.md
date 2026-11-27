# 10 — Especificação de Telas

Para cada tela: **referência** (arquivo em `/design` ou "novo"), **dados** (selector/rota), **layout**, **estados**, **interações**, **critérios de aceite**. Tokens e componentes: `09-design-system.md`.

Convenções:
- `V` = `useStudentView(studentId)`; `C` = `useClassView(classId)`.
- "Mobile" < 900px; "Desktop" ≥ 900px.
- Todo texto em PT-BR. Placeholder `[nome do app]` → `APP_NAME`.

---

## Shells

### StudentShell (`app/aluno/layout.tsx`)
- **Guarda:** sem sessão de aluno → `/`. Sem `consentAt` → `/aluno/consentimento`. Atualiza `ultimoAcesso`.
- **Mobile:** header (logo tracejado · `PointsPill` · `Avatar` → Perfil), conteúdo, `BottomNav` com **Início · Carreiras · Missões · Perfil** (ícones dos designs; ativo com pill `lime`).
- **Desktop:** `Sidebar` 232px com logo, **Início · Carreiras · Da Galera · Ficha e mentores** (como em `D-Inicio`), rodapé com avatar, nome e "Nível N · X pts". Missões ficam acessíveis pelos cards e pela Ficha (como no design desktop).
- Rotas de fluxo (`galera`, `semana`, `missoes/[code]`, `mentor-simulado`, `match`) usam `FullscreenFlow` (sem navegação).
- Toast "+N pts" global (canto inferior, acima da bottom nav).

### TeacherShell (`app/professor/layout.tsx`)
- Guarda: sessão professor.
- Sidebar: logo, **Turma** · **Planos**; rodapé "Prof.ª Helena Duarte · Matemática".
- Topo do conteúdo: `Select` de turma (1º EM A · 2º EM A · 3º EM A), padrão `2A`.

### DemoBar (layout raiz, se `NEXT_PUBLIC_DEMO_MODE=1`)
Faixa 32px `ink`/`lime` com: "Modo demo" · trocar perfil (Kauã, Bruno, Carla, Professor) · "Simular fim do semestre" (só aluno) · "Resetar dados" (confirmação) · `OfflineBadge` ("IA offline" quando houver `source: fallback` na sessão).

---

## 1. Landing / login — `/` — novo
- **Layout:** fundo `blue`, logo, h1 display "Bora descobrir pra onde a escola te leva." (branco), card branco com campo "Sua matrícula" (numérico, `inputMode="numeric"`), botão `lime` "Entrar", link "Sou professor(a) — entrar na demo".
- **Modo demo:** 3 chips abaixo: "Kauã · 2º EM", "Bruno · 2º EM", "Carla · 3º EM".
- **Estados:** erro "Não achamos essa matrícula. Confere com a secretaria?"; carregando no botão.
- **Aceite:** `2026001` entra como Kauã; Enter envia; foco visível; funciona sem JS de terceiros.

## 2. Consentimento — `/aluno/consentimento` — novo
- **Layout:** fundo `paper`; h1 "Antes de começar, o combinado."; 4 cards curtos com ícone:
  1. **O que a gente usa:** seu boletim, sua frequência e o que você responde aqui.
  2. **Pra quê:** te mostrar caminhos e o que destravar. **Suas notas nunca bloqueiam nenhuma carreira.**
  3. **Quem vê:** você e seu professor. Mentores só veem seu primeiro nome e o que você curte.
  4. **IA no meio:** algumas partes usam IA (Gemini). O mentor simulado é uma IA, não uma pessoa.
- Rodapé: link "Ler a versão completa" (Dialog com texto LGPD/ECA resumido) + botão primário "Bora".
- **Aceite:** sem "Bora" não acessa nenhuma tela do aluno; registra `consentAt`.

## 3. Início — `/aluno` — `Main`, `D-Inicio`
- **Dados:** `V.nome`, `V.pontos`, `V.nivel`, `V.faltam`, `V.missaoDoDia`, `V.galera` (respondidos/10), `V.semanaDisponivel`, `V.top4` (desktop), `V.matchDay`.
- **Ordem (mobile):**
  1. h1 "E aí, {nome}." + "Faltam **{faltam} pontos** pro nível {n+1}, que abre {abre}." (nível 5: "Você chegou no topo. Referência!").
  2. **LevelCard** (`ink`): "Nível {n} · {nome}" + "{pontos} / {proximo}" + barra `lime` + texto de esforço.
  3. **DailyMissionCard** (`lime` + sombra): overline "Missão do dia", chip código, título da missão, "+30 pts · {min} min", botão "Começar" → `/aluno/missoes/{code}`. Se já feita hoje: "Feita hoje ✓ · volta amanhã" + próxima sugestão.
  4. **GaleraResumeCard** (branco): quadrado azul "{x}/10", "Continua o Da Galera", "Faltam {10−x} cenários, uns {min} minutos" → `/aluno/galera`. Se não começou: "Faz o Da Galera" / "10 cenários, uns 5 minutos". Se concluído: vira **WeeklyChallengeCard** ("Desafio da semana · 3 cenários · +10").
  5. **MatchDayCard** (branco, borda): "Match Day · {data fim do semestre}" + contagem "{n} dias" + checklist de elegibilidade (3 itens com ✓/○) + no modo demo botão `ink` "Simular fim do semestre". Após match: "Seu match: {mentor} · Ver" → `/aluno/match`.
- **Desktop:** grid `auto-fit minmax(300px,1fr)`: LevelCard, DailyMission, Galera; linha "Carreiras que combinam com você" (3 mini-cards com cor `diaACor`, "combina:", título, chip BNCC) + link "Abrir o swipe"; card "Mentores de alta demanda · abrem no nível 4 · faltam X pts"; MatchDayCard.
- **Aceite:** valores batem com `07` (Kauã inicial: Nível 3 · Embalado, 1.240/1.500, faltam 260).

## 4. Da Galera — `/aluno/galera` — `M-Teste`, `D-Teste`
- **Layout mobile:** fundo `blue`; header (X "Sair do teste" → salva e volta · título "Da Galera" · "{i}/10"); `SegmentedProgress` 10; chip `lime` com `quando`; h1 30px com `enunciado`; 4 `OptionCard` (A–D) em `role="radiogroup"`; rodapé "Não tem resposta certa e ninguém vai te dar nota aqui." + botão "Próximo cenário" (`lime` + sombra) ou placeholder tracejado "Escolha uma opção".
- **Desktop:** coluna central com o cenário; à direita `LiveAffinityPanel` "Até agora, você curte" (top 3 eixos com barras, a partir do 3º cenário) + "Isso se mistura com a sua ficha BNCC pra sugerir carreiras. Quem decide o caminho é você."; link "Sair e continuar depois".
- **Interações:** selecionar = `answerGalera(id, key)` (salva na hora); teclado: setas navegam entre opções, 1–4/A–D selecionam, Enter avança; transição slide+fade. No 10º, botão "Ver meu resultado" → `finishGalera` (+50) → resultado.
- **Retomar:** abre no 1º cenário não respondido (Kauã tem 6 respondidos → abre no cenário 7, como no design).
- **Aceite:** não avança sem escolha; sair e voltar preserva; leitores de tela anunciam "Cenário 7 de 10".

## 5. Resultado — `/aluno/galera/resultado` — `M-Resultado`
- **Dados:** `V.perfil`, `fraseTitulo`, `V.top4`, `destravar`; textos de `/api/galera` (cache `galera:resultado`).
- **Layout:** header (voltar · pill `lime` "+50 pts por terminar"); overline "Da Galera · seu resultado"; h1 34px frase-título; card branco com 4 `AffinityBar` (rótulo + forte/médio/leve); "Caminhos que combinam" com 4 chips (tocar → detalhe da carreira); card `ink` "Habilidade pra destravar" (chip código + status + frase da IA ou fixa: "Pra chegar lá, destrava **estatística**: …"); aviso "Seu boletim mostra de onde você parte, não até onde você vai. Esses caminhos mudam conforme você explora."; botão `blue` "Ver carreiras".
- **Estado IA carregando:** frase da habilidade mostra texto fixo do seed; troca pelo da IA quando chega (sem layout shift).
- **Aceite:** Kauã sai com `analisar` e `esportes` fortes e "Analista de dados esportivos" entre os 4.

## 6. Desafio da semana — `/aluno/semana` — derivado de `M-Teste`
Igual ao Da Galera com 3 cenários `grupo: "semana"`, título "Desafio da semana", fundo `ink` (para diferenciar), ao fim +10 e volta ao Início com toast "Seu perfil ficou mais afiado".

## 7. Carreiras (swipe) — `/aluno/carreiras` — `M-Carreiras`, `D-Carreiras`
- **Dados:** `V.fila` (ranking `07 §3`), `V.swipe`.
- **Mobile:** header "Carreiras" + pill "{n} salvas". Card (`CareerSwipeCard`): topo colorido por `diaACor` com "{i} de 5 hoje" + "combina: {x} + {y}" + h2 nome; corpo com "Raio-x de um dia" (3 linhas hora/atividade), bloco "Onde a escola aparece" (chip código + frase) e link "Conversar com um mentor simulado" → chat. Card de trás visível (leve rotação). Botões: Passar (X, círculo), Salvar (marcador, círculo), "Quero conhecer" (pill `blue`).
- **Desktop:** card à esquerda; à direita painel com "Onde a escola aparece" (código, frase, **status na sua ficha**: "em desenvolvimento, subiu esta semana"), "Como chegar", **(Quanto ganha: oculto)**, CTA "Conversar com um mentor simulado · IA · tira dúvida e faz um mini-desafio valendo pontos", "Mentores reais dessa área" (`MentorList`).
- **Interações:** arrastar > 120px à direita = Salvar; à esquerda = Passar; botões equivalentes; teclado ←/→/Enter. "Quero conhecer" → `swipe(want)` (+10, 1x) → `/aluno/carreiras/{id}`. Fim da fila do dia → "Por hoje é isso! Volta amanhã ou veja suas salvas" + lista das salvas.
- **Aceite:** passada volta no fim da fila; nenhum filtro por nota; contador atualiza.

## 8. Detalhe da carreira — `/aluno/carreiras/[id]` — derivado de `D-Carreiras`
- Header colorido (`diaACor`) com nome, "combina:", botões Salvar/Quero conhecer (estado atual).
- Seções: Raio-x de um dia · Onde a escola aparece (todas as `skills` da carreira com o status do aluno; a primeira não dominada destacada + botão "Treinar essa" → missão) · Como chegar · **Mentores reais dessa área** · CTA mentor simulado.
- **MentorList:** para cada mentor com `careerIds` contendo a carreira:
  - `nivelMinimo ≤ nível`: avatar inicial, "{cargo} · {organizacao}", "perfil ilustrativo · disponível", botão "Quero no meu Match Day" (toggle → `preferMentor`; rótulo "Na sua lista ✓").
  - bloqueado: avatar com cadeado, nome oculto, cargo visível, "abre no nível {n} · faltam {x} pts".
- **Aceite:** Big Tech aparece bloqueado para Kauã (nível 3); a analista do clube pode ser marcada.

## 9. Mentor simulado — `/aluno/carreiras/[id]/mentor-simulado` — `M-Live` adaptado
- **Layout:** fundo `ink`, texto `paper`. Header: voltar · pill "Mentor simulado por IA" (sem "ao vivo"). Bloco: overline "Mentor simulado · IA", h1 nome da carreira, avatar abstrato (as barras de áudio do design viram **3 pontos animados** enquanto a IA "digita"). Área de conversa com bolhas: aluno à direita (`blue`), mentor à esquerda (`inkRaised`, borda `inkBorder`). `MiniChallengeChip` (`lime`): chip código + "Mini-desafio: +20 pts se você explicar". Campo de texto + botão enviar (círculo `lime`). 3 sugestões rápidas antes da 1ª mensagem: "Como é seu dia?", "Precisa ser bom em mat?", "Como eu começo?".
- **Rodapé:** "Isso é uma simulação por IA. Um(a) profissional de verdade abre no nível {n}." (link → Missões).
- **Interações:** abre com fala inicial do mentor (fallback fixo, sem chamada). Cada envio → `POST /api/mentor-simulado`; resposta com `miniDesafio` mostra o chip; resposta seguinte com `desafioResolvido: true` → +20 (1x por sessão) + toast "Mandou bem! +20"; `false` → mentor dá uma pista. Limite 12 turnos → "Bora continuar no Match Day com alguém de verdade?".
- **Aceite:** nunca pede dado pessoal; respostas curtas; offline usa roteiro de 3 turnos do fallback (com o desafio da média "2, 0, 1, 3 e 0 gols").

## 10. Missões — `/aluno/missoes` — `M-Missoes`
- Header "Missões" + `PointsPill`.
- Card `ink` "Pontos vêm de esforço, não só de nota" com grade 2×2: +40 evoluir no que você ainda não domina · +30 completar uma missão BNCC · +15 semana com presença em dia · +10 explorar carreiras e o Da Galera.
- "Abertas pra você": 3 linhas (chip código, título, "+30"), a 1ª com selo "Missão do dia"; feitas hoje com ✓ e desabilitadas.
- "Mentores que você destrava" (`MentorTiers`): 3 linhas — Profissionais da sua região (aberto desde o nível 1) · Universitários e técnicos (aberto no nível 2) · Alta demanda: Big Tech, medicina, executivos (nível 4 · faltam X pts); abertos com ícone `lime`, fechados com cadeado.
- **Aceite:** sugestões seguem `07 §8`.

## 11. Quiz — `/aluno/missoes/[code]` — novo
- **Layout:** `FullscreenFlow` fundo `paper`. Header: X · "Missão · {código}" · "{i}/4"; `SegmentedProgress` 4 (cores sobre claro: feito `blue`, atual `ink`, futuro `track`). Topo: título da missão (Bricolage 24px) + chip de interesse "⚽ futebol ▾" (Menu: futebol, games, música, moda, negócios, redes sociais) — trocar antes da 1ª resposta gera novo quiz.
- **Questão:** enunciado 18px/600; 4 `OptionCard` A–D (claros); botão "Responder". Após responder: opção certa vira `blue` com ✓, errada escolhida vira borda tracejada; card `ink` "Por quê" com `explicacao`; botão "Próxima".
- **Resumo:** h1 "{acertos} de 4"; se ≥ 3: "Você destravou {descricaoJovem} 🔓" + chip "{nível anterior} → {novo}"; linhas de pontos (+30, +40, +40); botão "Voltar pro início". Se < 3: "Bora de novo amanhã — cada tentativa conta" (+30).
- **Carregando:** skeleton + "Montando sua missão com {interesse}…" (máx. 15s → fallback).
- **Aceite:** 4 questões sempre; explicação após cada; pontos e nível conforme `07 §4`; heatmap do professor reflete.

## 12. Perfil / Ficha BNCC — `/aluno/perfil` — `M-Perfil`, `D-Perfil`
- Header: avatar, nome, "{série}º ano · Ensino Médio", pill "Nível N".
- h2 "Sua ficha BNCC" + "Montada a partir do boletim e das suas missões. Mostra de onde você parte, nunca limita pra onde você vai." (desktop acrescenta "Seu professor vê essa mesma ficha pra planejar as aulas.").
- Resumo da IA (`/api/diagnostico`, 2–3 frases) em card branco pequeno, opcional se offline.
- **"Você já manda bem"** (ícone ✓ azul): `SkillRow` dominadas (chip código `blue`, área, descrição).
- **"Bora destravar"** (ícone `lime`): `SkillRow` defasagem/em desenvolvimento com barra de `progresso` + rótulo + (desktop) "· N missões abertas".
- Botão "Ver missões pra essas habilidades".
- **Desktop:** coluna direita com LevelCard, `PointsTable` e `MentorTiers` (= "Ficha e mentores").
- **Aceite:** Kauã vê LGG701, LGG303, CHS101 em "manda bem"; MAT316, MAT310, CNT301 em "bora destravar".

## 13. Match Day — `/aluno/match` — novo
- **Pré-condição:** `semestreSimulado` ou data real ≥ fim do semestre; senão mostra contagem e checklist.
- **Não elegível:** h1 "Quase lá!" + lista `faltaPara` com botões para cada ação.
- **Revelação (elegível):** fundo `blue`. Sequência:
  1. "Match Day" (overline) + h1 "Seu semestre valeu." (se subiu de nível no simular: chip `lime` "Você chegou no nível 4 · Destravado!" com pop).
  2. Contagem 3‑2‑1 (Bricolage 120px).
  3. Card branco vira (rotateY) mostrando: avatar inicial, "{cargo} · {organizacao}", bio curta, "perfil ilustrativo".
  4. Confete (cores `blue`, `lime`, `ink`).
- Abaixo (fundo `paper`): card "Por que deu match" com 5 barras dos `fatores` (Afinidade, Carreira que você curtiu, Você pediu, Sua evolução, Seu engajamento) + texto da IA; card "Leva essas perguntas" com 3 perguntas; nota "Se você destravou um nível novo, ele vale pro próximo Match Day."
- Botão primário "Agendar conversa" → `ScheduleDialog` com 3 horários (radio) → "Confirmar" → tela "Combinado! {dia hora}. Você recebe o link pela escola." e o card do Início passa a mostrar o agendamento.
- **Aceite:** com o roteiro, Kauã dá match com a **analista de desempenho do clube da região** (preferência + carreira "Quero conhecer"); `prefers-reduced-motion` desliga contagem e confete.

---

## Professor

## 14. Mapa da turma — `/professor/turma/[classId]` — novo
- **Topo:** h1 "{nome da turma}" + "{n} alunos · {professor}"; `Select` de turma; legenda do heatmap.
- **SummaryCards (4):**
  1. Maior defasagem: "{code} · {x}% da turma" + descrição oficial curta.
  2. Top interesses: 3 chips (futebol, games, empreendedorismo).
  3. Vale uma conversa: "{n} alunos" → rola até a lista.
  4. Da Galera: "{x}% concluíram".
- **SkillHeatmap:** tabela com cabeçalho fixo; linhas = 16 habilidades (ordenadas por % defasagem), colunas = alunos (iniciais + nome em tooltip, clique → ficha), células 28px coloridas por nível (legenda: dominada/em desenvolvimento/defasagem/sem dado). Coluna à direita: "% defasagem" (mini barra) + botão `PillButton` pequeno **"Gerar plano"**.
- **Gerar plano:** abre `Popover` com interesse pré-selecionado (top 1 da turma) em chips trocáveis + campo "Observações (opcional)" + botão "Gerar" → loading "Consultando BNCC e Referencial…" → cria plano → navega para o editor.
- **DefasagemBars** (`@mui/x-charts` BarChart horizontal, top 6) — aba alternativa "Resumo" no mobile, no lugar do heatmap.
- **AttentionList "Vale uma conversa":** cartões com nome, motivos (bullets do `07 §7`), status (`atencao`/`acompanhando`), botão "Conversei" → `ConversationDialog` (data automática + nota livre, ≤ 280) → `acompanhando`.
- **Matches:** lista compacta "Kauã → Analista de desempenho (clube da região)".
- **Aceite:** 2A mostra "EM13MAT316 · 70%"; após a missão do Kauã, a célula dele muda sem recarregar; alertas não aparecem em nenhuma tela do aluno.

## 15. Ficha individual — `/professor/turma/[classId]/aluno/[studentId]` — novo
- Cabeçalho: nome, série, nível, pontos, frequência média, status de atenção com motivos.
- Habilidades por área (lista com status, média, tendência ↑→↓).
- Afinidades (barras) e carreiras de interesse (Quero conhecer/salvas).
- Match (se houver) e histórico de missões (código, acertos, data).
- Nota: "Use para conversar e planejar, nunca para rotular."

## 16. Editor de plano — `/professor/plano/[planId]` — novo
- **Layout desktop:** 2 colunas — esquerda (editor, 8/12), direita (`CitationsPanel` fixo, 4/12).
- **Cabeçalho:** chip status (Rascunho/Aprovado), chip `source` ("Gerado com IA" ou "Modelo offline"), título editável, "{turma} · {code} · {interesse} · 50 min".
- **Seções editáveis (TextField multiline):** Objetivo · Etapas (cada uma: nome, minutos, descrição; chips "[1]" "[3]" das citações usadas; adicionar/remover etapa; soma de minutos com aviso se ≠ 50) · Avaliação · Adaptações por nível (3 campos rotulados).
- **EthicsSeal:** card com título "Selo Referencial de IA na Educação" e checklist (critério · ✓/○ · como atende · citação). Selo "verificado" só se todos atendidos; o professor pode marcar/desmarcar.
- **CitationsPanel:** lista numerada [n] com ref (chip), fonte e **texto oficial do chunk**; clicar num chip de citação na etapa destaca o item.
- **Ações:** "Salvar rascunho" (automático a cada edição, debounce) · "Regenerar" (confirma perda de edições) · **"Aprovar plano"** (primário) → status aprovado + `aprovadoEm` → snackbar "Plano aprovado. Ele é seu — a IA só sugeriu." → botão "Ver planos".
- **Aceite:** toda citação exibida vem do corpus; aprovar exige ≥ 1 etapa e objetivo preenchido.

## 17. Planos — `/professor/planos` — novo
Lista de cards (título, turma, código, interesse, status, data) com filtro por turma; clique abre o editor (somente leitura se aprovado, com botão "Editar novamente" que volta para rascunho).

---

## Acessibilidade (todas as telas)
- Contraste AA (ver `09`); foco visível 3px `blue` com offset 2px (sobre `blue`: `lime`).
- Opções como `radiogroup`; progresso com `role="progressbar"` e `aria-valuenow`.
- Heatmap: cada célula com `aria-label="{aluno}, {code}: {nível}"`; tabela navegável.
- Swipe sempre com botões equivalentes (nunca só gesto).
- `prefers-reduced-motion` respeitado.
- Alvos ≥ 44px; texto mínimo 13px.
