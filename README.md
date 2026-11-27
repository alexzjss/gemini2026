<div align="center">

<img src="app/icon.svg" alt="Símbolo do Próxio" width="72" />

# Próxio

**Seu próximo passo começa aqui.**

Plataforma web contra a evasão escolar no Ensino Médio público. Ela liga o que o aluno estuda
ao futuro que ele quer, e dá ao professor um mapa claro de onde a turma trava.

`Next.js 15` · `TypeScript strict` · `MUI` · `Gemini 2.5 Flash` · `RAG (BNCC + Referencial de IA do MEC)` · `Vitest`

</div>

![Início do aluno](docs/screenshots/03-inicio.png)

---

## Por que existe

O aluno se desengaja quando não vê sentido no que estuda, e esse desengajamento é a porta de entrada da evasão. O professor, por sua vez, não tem dado acionável sobre **quais habilidades** a turma não domina nem **o que motiva** esses alunos.

O Próxio atua nos dois lados:

| Para quem | O que entrega |
|---|---|
| **Aluno** (14–18 anos, celular primeiro) | Descobre o que curte sem "cara de prova", vê quais habilidades da BNCC destravam esses caminhos, treina em missões curtas e, no fim do semestre, conversa com um(a) mentor(a) de verdade no **Match Day**. |
| **Professor(a)** | Mapa da turma (habilidades BNCC × alunos × interesses), alunos que "valem uma conversa" com o motivo, e plano de aula gerado com fundamentação oficial, sempre revisado e aprovado por ele(a). |
| **Mentor(a)** | Tempo voluntário direcionado a jovens engajados. No MVP aparece como dado no seed e como resultado do match. |

## Princípios que o produto cumpre

1. **Boletim não é destino.** Nenhuma carreira ou mentor some por causa de nota. O boletim só mostra de onde o aluno parte.
2. **Mérito por esforço.** Os pontos vêm de missões, frequência e evolução nas próprias fragilidades. Nota alta vale **+0**.
3. **Decisões determinísticas e auditáveis.** Nível, pontos, ranking de carreiras, match e sinais de atenção são código em `lib/domain/`, coberto por testes. A IA só redige texto.
4. **Professor no comando.** Todo plano de aula é editável e só existe "oficialmente" depois de aprovado.
5. **Sem rótulos.** Sinais de evasão aparecem **somente** na tela do professor, como "vale uma conversa" com motivos. Nunca para o aluno, nunca como nota de risco.
6. **Privacidade.** Nome, frequência e sinais de evasão não são enviados ao Gemini. A chave de API fica só no servidor.
7. **IA sempre identificada.** O mentor simulado se apresenta como IA, nunca pede dados pessoais, e há guardrail de saída.

---

## O produto, tela a tela

Os prints abaixo foram capturados do app em execução (build de produção), seguindo a jornada do aluno **Kauã** e da **Prof.ª Helena**.

### 1. Entrada e consentimento

O aluno entra só com a matrícula (o boletim já vem da escola). No primeiro acesso, uma tela explica em linguagem jovem quais dados são usados, para quê, quem vê e que **nota nunca bloqueia carreira**.

| Entrada | Consentimento |
|---|---|
| ![Landing](docs/screenshots/01-landing.png) | ![Consentimento](docs/screenshots/02-consentimento.png) |

### 2. Início

Nível, pontos e quanto falta para o próximo; **Missão do dia** escolhida por regra (primeira habilidade não dominada ligada à carreira nº 1 do aluno); desafio da semana; contagem regressiva do Match Day; carreiras que combinam.

![Início](docs/screenshots/03-inicio.png)

### 3. Ficha BNCC (Perfil)

O boletim vira uma ficha de habilidades: "Você já manda bem" e "Bora destravar", cada uma com código BNCC, descrição jovem, barra de progresso e tendência. Ao lado, nível, pontos, a tabela de como se ganha ponto e os mentores que cada nível abre.

![Ficha BNCC](docs/screenshots/04-perfil.png)

### 4. Teste "Da Galera"

Dez cenários do dia a dia, um por tela, sem cara de prova. O progresso é salvo e dá para continuar depois. No resultado: frase-título, os 4 eixos mais fortes, 4 caminhos que combinam e **uma habilidade para destravar**.

| Cenário | Resultado |
|---|---|
| ![Da Galera](docs/screenshots/05-galera.png) | ![Resultado](docs/screenshots/06-galera-resultado.png) |

### 5. Carreiras e mentores

Swipe de carreiras (passar, salvar, **quero conhecer**). O detalhe mostra o raio-x de um dia, **onde a escola aparece** naquela profissão (com o status do aluno na habilidade), e os mentores reais da área: disponíveis para o Match Day, ou bloqueados com "abre no nível N" e nome oculto.

| Swipe | Detalhe |
|---|---|
| ![Carreiras](docs/screenshots/07-carreiras.png) | ![Detalhe](docs/screenshots/08-carreira-detalhe.png) |

### 6. Mentor simulado (IA)

Conversa por texto com uma IA no papel de um profissional da área, sempre identificada como simulação. Propõe um mini-desafio BNCC ligado à profissão (+20 pts). O rodapé lembra que um(a) profissional de verdade abre em determinado nível.

![Mentor simulado](docs/screenshots/09-mentor-simulado.png)

### 7. Missões e quiz

Tabela de pontos, três missões sugeridas e mentores por nível. O quiz abre em tela cheia, com o interesse do aluno (ex.: futebol), explicação após cada resposta e, se aprovou (≥ 3 de 4), a habilidade **sobe de nível**.

| Missões | Quiz | Resumo |
|---|---|---|
| ![Missões](docs/screenshots/10-missoes.png) | ![Quiz](docs/screenshots/11-quiz.png) | ![Resumo](docs/screenshots/12-quiz-resumo.png) |

### 8. Match Day

No fim do semestre o esforço vira conexão real. A revelação mostra o mentor e **por que deu match** (afinidade, carreira curtida, preferência, evolução e engajamento, cada fator com sua pontuação). Depois, o aluno agenda uma conversa de 20 minutos.

Quem não for elegível vê, de forma encorajadora, o que falta.

| Antes | Revelação | Agendar |
|---|---|---|
| ![Antes](docs/screenshots/18-match-antes.png) | ![Revelação](docs/screenshots/19-match-revelacao.png) | ![Agenda](docs/screenshots/20-match-agenda.png) |

### 9. Painel do professor

**Mapa da turma:** maior defasagem, top interesses (derivados das carreiras que a turma salva), quantos alunos valem uma conversa e % que fez o Da Galera. O heatmap cruza habilidades BNCC × alunos, com % de defasagem por linha e o botão **Gerar plano**. O progresso do aluno no mesmo navegador aparece no mapa (a célula muda após a missão).

![Mapa da turma](docs/screenshots/13-professor-mapa.png)

**Ficha individual:** nível, frequência, habilidades por área, afinidades e o motivo de cada alerta, com o botão **Conversei** (o aluno passa a "acompanhando", com data e nota).

![Ficha do aluno](docs/screenshots/17-ficha-aluno-professor.png)

### 10. Plano de aula com RAG

O professor escolhe a habilidade e o interesse da turma (já vem o nº 1 pré-selecionado). O plano sai com objetivo, etapas com minutos (soma conferida), campos editáveis e painel de **citações** com o texto literal da BNCC e do Referencial de IA na Educação (MEC). O selo ético lembra que o plano só vale depois do **Aprovar**.

| Editor | Planos aprovados |
|---|---|
| ![Editor de plano](docs/screenshots/15-plano-editor.png) | ![Planos](docs/screenshots/16-planos-aprovados.png) |

### 11. Mobile

O aluno acessa principalmente pelo celular. A navegação vira barra inferior e todo o fluxo funciona em tela estreita.

| Início | Ficha | Carreiras | Missões | Da Galera |
|---|---|---|---|---|
| <img src="docs/screenshots/22-mobile-inicio.png" width="160" /> | <img src="docs/screenshots/23-mobile-perfil.png" width="160" /> | <img src="docs/screenshots/24-mobile-carreiras.png" width="160" /> | <img src="docs/screenshots/25-mobile-missoes.png" width="160" /> | <img src="docs/screenshots/26-mobile-galera.png" width="160" /> |

> **Sobre os prints.** Foram gerados sem `GEMINI_API_KEY`, portanto os textos de IA (mentor, quiz, plano) vêm dos fallbacks versionados em `data/fallbacks/`, e o selo **"IA offline"** aparece no canto. É o comportamento previsto: o app nunca devolve erro por falha de IA. Com a chave configurada, esses textos são gerados pelo Gemini, e o plano de aula traz as citações recuperadas do corpus (no print do editor, o painel de citações está vazio por causa do fallback).

---

## Como funciona

### Regras de negócio (código, não prompt)

| Tema | Regra | Onde |
|---|---|---|
| Diagnóstico | Média das avaliações por habilidade: ≥ 7 dominada · 5–7 em desenvolvimento · < 5 defasagem. Tendência pelo 1º → 2º bimestre. | `lib/domain/diagnostico.ts` |
| Afinidades | 6 eixos a partir dos cenários do Da Galera; frase-título por tabela fixa. | `lib/domain/afinidades.ts` |
| Carreiras | Similaridade por cosseno + bônus de salva/quero conhecer. Carreira "passada" vai para o fim da fila, **nunca some**. | `lib/domain/carreiras.ts` |
| Pontos | Galera +50 · missão +30 · aprovada +40 · habilidade subiu +40 · semana com presença +15 · explorar carreira +10 · mentor simulado +20. Nota alta: +0. | `lib/domain/pontos.ts` |
| Níveis | 1 Começando (0) · 2 Na Pista (300) · 3 Embalado (700) · 4 Destravado (1.500) · 5 Referência (2.500). | `lib/domain/niveis.ts` |
| Match | Score 0–100: afinidade 40 + carreira 25 + preferência 10 + evolução 15 + engajamento 10. Só concorrem mentores abertos ao nível do aluno e com vaga. | `lib/domain/match.ts` |
| Atenção | Frequência < 75%, queda de frequência, inatividade ≥ 14 dias, notas em queda. Sem "score de risco". | `lib/domain/evasao.ts` |
| Elegibilidade | Da Galera concluído + ≥ 1 missão + frequência ≥ 60%. | `lib/domain/match.ts` |

Detalhes e justificativas em [`docs/07-regras-de-negocio.md`](docs/07-regras-de-negocio.md).

### IA com rédea curta

- Toda chamada passa por `generateJson`: **schema zod + timeout + retry + fallback**. As rotas respondem `{ data, source }` e não devolvem 500.
- O Gemini só **redige**: texto do quiz, explicação do match, respostas do mentor simulado e plano de aula. Nunca escolhe mentor, nível ou pontos.
- **RAG** sobre o corpus oficial (BNCC do Ensino Médio e Referencial de IA na Educação), com embeddings `text-embedding-004`, busca por cosseno e fallback lexical. Os textos da BNCC são literais; as citações do plano usam o chunk recuperado.
- **GraphRAG** no mentor simulado: grafo de competências com pré-requisitos, trilha adaptativa e domínio por habilidade (`lib/grafo/`, `lib/rag/graphrag.ts`). Ver [`docs/11-grafo-educacional.md`](docs/11-grafo-educacional.md).
- **Guardrails** de entrada e saída (`lib/ai/guardrails.ts`) e um script de red team (`npm run redteam`).

### Arquitetura

```
Navegador (Next.js App Router, MUI, framer-motion)
  ├─ Estado: seed JSON + localStorage (gemini2026:v1)
  ├─ lib/domain  → regras determinísticas (puras, testadas)
  └─ fetch → /api/*
Servidor (Vercel, runtime Node)
  ├─ /api/diagnostico  · /api/galera  · /api/missao
  ├─ /api/mentor-simulado  · /api/match  · /api/plano-aula
  └─ lib/ai (generateJson + guardrails) · lib/rag (retriever) · data/fallbacks
```

Detalhes: [`docs/04-arquitetura.md`](docs/04-arquitetura.md).

---

## Rodando localmente

Requisitos: Node 20+.

```bash
npm install
cp .env.example .env.local     # GEMINI_API_KEY é opcional
npm run dev                    # http://localhost:3000
```

| Variável | Para quê |
|---|---|
| `GEMINI_API_KEY` | Ativa a IA generativa e os embeddings (só servidor). Sem ela, o app usa os fallbacks. |
| `GEMINI_MODEL` | Padrão `gemini-2.5-flash`. |
| `GEMINI_EMBED_MODEL` | Padrão `text-embedding-004`. |
| `NEXT_PUBLIC_DEMO_MODE` | `1` mostra a barra de demo (trocar perfil, simular fim do semestre, resetar dados). |

### Perfis para testar

| Entrar como | Matrícula | Para ver |
|---|---|---|
| **Kauã** (2º EM A) | `2026001` | A jornada completa: Da Galera pela metade, missão do dia, subida de nível e Match Day. |
| **Bruno** (2º EM A) | `2026002` | Nível 4 e sinais de atenção (frequência) no painel do professor. |
| **Carla** (3º EM A) | `2026003` | Nível 1: nota alta sozinha não basta, esforço abre portas. |
| **Professor(a)** | botão "Sou professor(a)" | 2º EM A, mapa, plano de aula. |

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` / `build` / `start` | Desenvolvimento, build (roda os testes antes) e produção. |
| `npm test` | Testes de domínio, IA e RAG (Vitest, 169 testes). |
| `npm run typecheck` · `npm run lint` | TypeScript e ESLint. |
| `npm run seed` | Regenera o seed. |
| `npm run corpus` · `npm run embed` | Monta o corpus oficial e gera os embeddings. |
| `npm run fallbacks` | Regenera os textos de fallback da IA. |
| `npm run redteam` | Ataques de prompt contra os guardrails. |

---

## Estado atual e limites

Este é um MVP funcional, não um produto em produção. Para ser honesto sobre o que é real e o que é simulado:

**Funciona de ponta a ponta**
- Jornada completa do aluno e do professor, em desktop e mobile.
- Regras de pontos, níveis, match e atenção, com testes automatizados (169 passando).
- Pipeline de IA com validação, timeout e fallback; RAG sobre o corpus oficial; GraphRAG no mentor.
- Funciona offline de IA (modo fallback).

**Simulado no MVP**
- Dados de alunos, boletim, frequência, escolas e mentores são **fictícios** (`data/seed/`). Mentores aparecem como "perfil ilustrativo".
- Sem autenticação nem banco: o estado do aluno fica no `localStorage` do navegador.
- O Match Day é "simulado" pela barra de demo; agendamento não chama serviço externo.

**Roadmap**
- Autenticação real e banco de dados (o modelo do grafo já é de property graph, pronto para Neo4j).
- Integração com a secretaria/boletim estadual.
- Interface do mentor real e videochamada; mentor por voz (Gemini Live).
- Faixa salarial (Novo CAGED/RAIS), PDF do plano, notificações, painel do gestor, indicar colega (nível 5).

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Regras e contexto para quem implementa |
| [docs/01-contexto-produto.md](docs/01-contexto-produto.md) | Problema, personas, proposta de valor, princípios |
| [docs/02-decisoes.md](docs/02-decisoes.md) | Registro de decisões |
| [docs/03-escopo-mvp.md](docs/03-escopo-mvp.md) | Histórias, rotas, fora do escopo, roteiro de demo |
| [docs/04-arquitetura.md](docs/04-arquitetura.md) | Stack, pastas, estado, contratos das rotas, RAG, deploy |
| [docs/05-modelo-de-dados.md](docs/05-modelo-de-dados.md) | Tipos e especificação do seed |
| [docs/06-ia-rag-prompts.md](docs/06-ia-rag-prompts.md) | Cliente Gemini, prompts, corpus, retriever, fallbacks |
| [docs/07-regras-de-negocio.md](docs/07-regras-de-negocio.md) | Diagnóstico, afinidades, pontos, níveis, match, evasão |
| [docs/08-plano-implementacao.md](docs/08-plano-implementacao.md) | Plano de execução do hackathon |
| [docs/09-design-system.md](docs/09-design-system.md) | Tokens, tipografia, componentes e movimento |
| [docs/10-telas.md](docs/10-telas.md) | Especificação de todas as telas |
| [docs/11-grafo-educacional.md](docs/11-grafo-educacional.md) | Grafo de competências, trilha adaptativa e GraphRAG |
| [design/](design/) · [prototipo-aluno/](prototipo-aluno/) | Protótipos de referência (fora do bundle) |

## Deploy

Vercel conectado ao GitHub (`main` em produção, PRs em preview). Configure `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_EMBED_MODEL` e `NEXT_PUBLIC_DEMO_MODE`. As rotas de IA usam `maxDuration` de 30 s.
