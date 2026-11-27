# CLAUDE.md — Contexto para agentes

Projeto **Gemini2026** (nome provisório, constante `APP_NAME` em `lib/config.ts`): plataforma web contra evasão escolar no Ensino Médio público. MVP de hackathon, **2h**, demo para banca. Leia `docs/` antes de implementar; `docs/02-decisoes.md` é a fonte de verdade.

## Resumo
- Next.js App Router + TypeScript strict + Tailwind; API routes no servidor; deploy Vercel.
- IA: `@google/genai`, `gemini-2.5-flash` (JSON mode + `responseSchema`), embeddings `text-embedding-004` (env `GEMINI_EMBED_MODEL`).
- Dados: seed JSON em `data/seed/`, progresso do usuário demo em `localStorage` (`gemini2026:v1`). Sem banco, sem auth real (matrícula fake / botão professor demo).
- RAG: corpus curado BNCC + Referencial de IA (MEC) em `data/corpus/`, embeddings pré-calculados (`npm run embed`), cosseno em memória, fallback por palavra-chave.
- Módulos: (1) boletim → ficha BNCC, (2) teste vocacional gamificado, (3) pontos/tiers/missões/Match Day com botão "Simular fim do semestre", (4) painel do professor com mapa da turma, alertas de evasão e plano de aula RAG com aprovação.
- Fora: Gemini Live, interface do mentor, PDF, atividade gamificada separada.

## Regras de implementação
1. **Decisões são código determinístico** em `lib/domain/` (diagnóstico, pontos, tiers, match, evasão). O Gemini só redige texto. Nunca deixe o LLM escolher o mentor ou o nível de habilidade.
2. **Nenhuma carreira ou mentor é filtrado por nota.** Tiers dependem de pontos (esforço/evolução), não de nota absoluta.
3. Toda chamada de IA passa por `generateJson` com validação zod e **fallback** em `data/fallbacks/`; a resposta da rota é `{ data, source }`.
4. `GEMINI_API_KEY` só no servidor. Não envie nome do aluno nem sinais de evasão ao Gemini.
5. Sinais de evasão aparecem **somente** na UI do professor.
6. Citações do plano de aula usam o texto real do chunk recuperado, nunca o texto gerado.
7. UI do aluno: PT-BR, mobile-first, tom jovem sem gíria forçada, WCAG AA básico. UI do professor: técnica.
8. Textos da BNCC/Referencial no corpus devem ser literais dos documentos oficiais — não invente.

## Mapa dos docs
`01` produto · `02` decisões · `03` escopo/telas/roteiro de demo · `04` arquitetura/rotas · `05` tipos/seed · `06` prompts/RAG · `07` regras (pontos, tiers, score de match, evasão) · `08` cronograma.
