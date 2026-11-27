# Gemini2026 (nome provisório)

Ecossistema web de **combate à evasão escolar e planejamento pedagógico** para o Ensino Médio da rede pública. Une:

1. **Diagnóstico curricular** — boletim (via matrícula) traduzido em habilidades da BNCC.
2. **Descoberta gamificada de interesses** — teste vocacional "da galera", sem cara de prova.
3. **Conexão com o mercado** — Match Day semestral com mentores, liberado por engajamento.
4. **Inteligência para o professor** — mapa da turma (defasagens × interesses × risco de evasão) e plano de aula gerado via RAG na BNCC e no Referencial de IA na Educação (MEC).

> Contexto: MVP de hackathon/edital, **2 horas de desenvolvimento**, demo para banca. Integrações externas são simuladas com dados mock realistas.

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Contexto condensado para agentes de IA que vão implementar |
| [docs/01-contexto-produto.md](docs/01-contexto-produto.md) | Problema, persona, proposta de valor, princípios |
| [docs/02-decisoes.md](docs/02-decisoes.md) | Registro de todas as decisões tomadas (ADR) |
| [docs/03-escopo-mvp.md](docs/03-escopo-mvp.md) | Funcionalidades, histórias, telas, fora de escopo, roteiro de demo |
| [docs/04-arquitetura.md](docs/04-arquitetura.md) | Stack, diagrama, pastas, rotas, fluxos |
| [docs/05-modelo-de-dados.md](docs/05-modelo-de-dados.md) | Tipos TypeScript e especificação do seed |
| [docs/06-ia-rag-prompts.md](docs/06-ia-rag-prompts.md) | Pipeline RAG, prompts, schemas de saída, fallback |
| [docs/07-regras-de-negocio.md](docs/07-regras-de-negocio.md) | Diagnóstico, pontos, tiers, algoritmo de match, alerta de evasão |
| [docs/08-plano-implementacao.md](docs/08-plano-implementacao.md) | Cronograma de 2h e divisão de tarefas |

## Stack resumida

Next.js (App Router) + TypeScript + Tailwind · API routes no servidor · `@google/genai` (Gemini 2.5 Flash + embeddings) · seed JSON + `localStorage` · deploy na Vercel.
