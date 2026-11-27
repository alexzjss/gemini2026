# Gemini2026 (nome provisório)

Ecossistema web de **combate à evasão escolar e planejamento pedagógico** para o Ensino Médio da rede pública. Une:

1. **Diagnóstico curricular**: o boletim (via matrícula) vira uma ficha de habilidades da BNCC.
2. **Descoberta gamificada de interesses**: o teste "Da Galera" e o swipe de carreiras, sem cara de prova.
3. **Conexão com o mercado**: missões BNCC, níveis por esforço, mentor simulado por IA e o **Match Day** semestral com mentores reais.
4. **Inteligência para o professor**: mapa da turma (defasagens × interesses × sinais de evasão) e plano de aula gerado via RAG na BNCC e no Referencial de IA na Educação (MEC), com aprovação do professor.

> MVP de hackathon/edital: **2 horas** de desenvolvimento, demo para banca. Integrações externas são simuladas com dados fictícios.

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Contexto condensado e regras para quem implementa |
| [docs/01-contexto-produto.md](docs/01-contexto-produto.md) | Problema, personas, proposta de valor, princípios |
| [docs/02-decisoes.md](docs/02-decisoes.md) | Registro de decisões (rodadas 1 e 2) |
| [docs/03-escopo-mvp.md](docs/03-escopo-mvp.md) | Histórias, rotas, fora do escopo, roteiro de demo |
| [docs/04-arquitetura.md](docs/04-arquitetura.md) | Stack, pastas, estado, contratos das rotas, RAG, deploy |
| [docs/05-modelo-de-dados.md](docs/05-modelo-de-dados.md) | Tipos TypeScript e especificação do seed |
| [docs/06-ia-rag-prompts.md](docs/06-ia-rag-prompts.md) | Cliente Gemini, prompts, corpus, retriever, fallbacks |
| [docs/07-regras-de-negocio.md](docs/07-regras-de-negocio.md) | Diagnóstico, afinidades, pontos, níveis, match, evasão |
| [docs/08-plano-implementacao.md](docs/08-plano-implementacao.md) | Plano de execução de 2h: papéis, Git, frentes, checkpoints |
| [docs/09-design-system.md](docs/09-design-system.md) | Tokens, tipografia, componentes e movimento |
| [docs/10-telas.md](docs/10-telas.md) | Especificação de todas as telas |
| [docs/11-handoff-agente1.md](docs/11-handoff-agente1.md) | O que a fundação entregou e os stubs provisórios |
| [design/](design/) | Protótipos das telas do aluno (Claude Design) |

## Stack

Next.js 15 (App Router) + TypeScript · MUI com tema custom · framer-motion · `@google/genai` (Gemini 2.5 Flash + embeddings) · seed JSON + `localStorage` · Vercel.
