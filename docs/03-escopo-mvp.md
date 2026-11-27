# 03 — Escopo do MVP

## Módulos dentro do escopo

### M1 — Entrada, consentimento e diagnóstico (Boletim → BNCC)

- **US-01** Como aluno, digito meu código de matrícula (ex.: `2026001`) e entro.
- **US-02** Na primeira entrada vejo uma **tela de consentimento** curta: quais dados usamos (boletim, frequência, respostas dos desafios), para quê, quem vê (eu e meu professor), e que **minhas notas nunca bloqueiam nenhuma carreira**. Botão "Bora" registra `consentAt` no `localStorage`.
- **US-03** Vejo minha **Ficha BNCC**: habilidades agrupadas por área, cada uma com status `dominada` / `em desenvolvimento` / `defasagem`, e um resumo curto escrito pela IA no tom jovem ("Você manda bem em X; Y é sua próxima conquista").

### M2 — Teste vocacional gamificado ("Descubra seu rolê")

- **US-04** Respondo **8 micro-cenários** (dilemas do dia a dia, cultura pop, esportes, tecnologia, negócios), cada um com 3–4 escolhas visuais (emoji + texto curto). Barra de progresso, sem cronômetro, sem "certo/errado".
- **US-05** Ao terminar, vejo meu **perfil de afinidades** (6 eixos, ver `07`) e **3 carreiras sugeridas**. Para cada carreira: por que combina (afinidades) e **quais habilidades BNCC destravar** (cruzando com a minha ficha). Nenhuma carreira é escondida por nota.
- **US-06** Ganho pontos por completar o teste (+20).

### M3 — Dashboard, missões, pontos e Match Day

- **US-07** Meu **dashboard** mostra: pontos, tier atual (Bronze/Prata/Ouro) e quanto falta pro próximo, frequência, habilidades em evolução, missões disponíveis e contagem regressiva para o Match Day. **Sem feed, sem swipe.**
- **US-08** Abro uma **missão**: quiz de 3–5 questões gerado pela IA sobre uma habilidade em defasagem/desenvolvimento, contextualizado no meu interesse principal (ex.: estatística com futebol). Recebo feedback com explicação após cada questão (dica, não só gabarito).
- **US-09** Ao concluir: +30 pontos; se acertar ≥ 70%, a habilidade sobe um nível (defasagem → em desenvolvimento → dominada) e ganho o bônus de evolução (+80 ou +50).
- **US-10** No modo demo, clico **"Simular fim do semestre"**: o sistema consolida histórico, calcula o score com todos os mentores do meu tier ou abaixo, e revela o **Match Oficial** em uma tela de celebração com: mentor, área, por que deu match (fatores do score + texto do Gemini) e sugestões de 3 perguntas para levar à conversa.
- **US-11** Se ainda não tiver os critérios mínimos para o Match (ver `07`), vejo o que falta, de forma encorajadora.

### M4 — Painel do professor e plano de aula via RAG

- **US-12** Entro como professor (botão demo) e escolho uma turma (1º, 2º ou 3º EM).
- **US-13** Vejo o **mapa da turma**:
  - Ranking de habilidades BNCC com % de alunos em defasagem (ex.: "65% em defasagem em EM13MAT316").
  - Top interesses da turma (agregado das afinidades/carreiras).
  - Lista de alunos com **sinais de atenção (evasão)** e os motivos (frequência, inatividade, queda de notas).
  - Clique em aluno → ficha individual (BNCC + afinidades + pontos).
- **US-14** Seleciono uma habilidade + um interesse da turma e clico **"Gerar plano de aula"**. O servidor faz RAG (BNCC + Referencial), chama o Gemini e devolve um **roteiro estruturado** com **citações** dos trechos recuperados e um **selo ético** (checklist do Referencial).
- **US-15** Edito o plano em campos de texto e clico **Aprovar**. O plano fica salvo como `aprovado` (localStorage) e aparece em "Planos aprovados".

## Telas

| Rota | Tela |
|---|---|
| `/` | Landing: "Sou aluno" (campo matrícula) / "Sou professor (demo)" |
| `/aluno/consentimento` | Consentimento (primeiro acesso) |
| `/aluno` | Dashboard |
| `/aluno/ficha` | Ficha BNCC |
| `/aluno/vocacional` | Teste vocacional ("Descubra seu rolê") + resultado |
| `/aluno/missao/[skillCode]` | Quiz da missão |
| `/aluno/match` | Match Day (estado pré/pós) |
| `/professor` | Seleção de turma |
| `/professor/turma/[classId]` | Mapa da turma + alertas |
| `/professor/turma/[classId]/aluno/[studentId]` | Ficha individual |
| `/professor/plano` | Gerador / editor de plano de aula |
| `/professor/planos` | Planos aprovados |

Barra superior fixa com **toggle "Modo demo"** (mostra botão de simular semestre e "resetar dados") e badge **"IA offline"** quando o fallback é usado.

## Fora do escopo (roadmap)

- Gemini Live (simulador de carreira por voz) — pós-Match, antes da conversa com o mentor.
- Interface do mentor, agenda e videochamada.
- Integração real com secretaria/SED/boletim; Auth real; banco de dados.
- Atividade gamificada separada no plano de aula; exportar PDF.
- "Por que estou vendo isso?" em toda sugestão; selo "IA ajuda, você pensa" nas missões.
- Notificações push, app nativo, multi-escola, painel de gestor/diretoria.

## Roteiro de demo (≈ 4 min)

1. **Aluna heroína "Ana" (1º EM, `2026001`)** — defasagem em Estatística, frequência ok, curte futebol e games. Consentimento → Ficha BNCC → teste vocacional → carreiras (Analista de dados esportivos, Game designer, Jornalista esportivo) → missão de EM13MAT316 com futebol → habilidade sobe → pontos.
2. **"Simular fim do semestre"** → Match com mentora Prata (analista de dados de um clube) + justificativa.
3. **Professor** → turma 1º EM → "65% em defasagem em EM13MAT316" + "Top interesses: Games, Futebol, Empreendedorismo" + 3 alertas de atenção (um é o herói "Bruno").
4. **Gerar plano** EM13MAT316 × Futebol → roteiro com citações BNCC + selo → editar uma linha → Aprovar.
5. Mostrar **Bruno (`2026002`)**: nota baixa mas grande evolução → mesmo assim chega ao Ouro (meritocracia por esforço).

Terceiro herói: **"Carla" (3º EM, `2026003`)**, notas altas e baixo engajamento → fica no Bronze, mostra que nota sozinha não basta.
