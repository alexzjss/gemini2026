# CLAUDE.md — Contexto para agentes

Projeto **Gemini2026** (nome provisório, `APP_NAME` em `lib/config.ts`): plataforma web contra evasão escolar no Ensino Médio público. MVP de hackathon, **2h**, demo para banca. Antes de implementar, leia `docs/`. Em caso de conflito, `docs/02-decisoes.md` (rodada 2) vence.

## Onde está cada coisa
- `docs/02` decisões · `03` escopo, rotas, roteiro de demo · `04` arquitetura e contratos · `05` tipos e seed · `06` prompts e RAG · `07` regras (pontos, níveis, match, evasão) · `08` plano de execução · `09` design system · `10` especificação tela a tela.
- `design/*.dc.html`: protótipos do aluno (Claude Design). São referência visual; não entram no bundle.
- `prototipo-aluno/`: protótipo navegável das telas do aluno em HTML/CSS/JS puro (fora do Next). Referência de interação; não entra no bundle.

## Stack
Next.js 15 App Router + TypeScript strict · **MUI com tema custom** (sem Tailwind) · framer-motion · canvas-confetti · @mui/x-charts · `@google/genai` (`gemini-2.5-flash`, embeddings `text-embedding-004`) · zod · Vitest (só `lib/domain`) · seed JSON + `localStorage` (`gemini2026:v1`) · Vercel.

## Regras de implementação
1. **Decisões são código determinístico** em `lib/domain/` (nível de habilidade, pontos, níveis, ranking de carreiras, missão do dia, match, evasão). O Gemini só redige texto. Nunca deixe o LLM escolher mentor, nível ou pontos.
2. **Nenhuma carreira ou mentor some por causa de nota.** Níveis dependem de pontos de esforço; nota alta vale +0.
3. Toda chamada de IA passa por `generateJson` (zod + timeout + fallback em `data/fallbacks/`); rotas respondem `{ data, source }` e nunca 500 na demo.
4. `GEMINI_API_KEY` só no servidor. Não envie nome, frequência nem sinais de evasão ao Gemini.
5. Sinais de evasão aparecem **somente** na UI do professor.
6. Citações do plano de aula usam o texto real do chunk recuperado.
7. Textos da BNCC e do Referencial no corpus são literais dos documentos oficiais. Nunca gere esses textos.
8. Visual: siga `docs/09` e os protótipos em `design/`. Tokens só em `lib/theme.ts`; não espalhe hex pelos componentes.
9. Mentor simulado é sempre identificado como IA e nunca pede dados pessoais.
10. Arquivos compartilhados (`lib/types.ts`, `lib/config.ts`, `lib/theme.ts`) mudam em PR próprio e pequeno.
11. Heróis do roteiro: Kauã `2026001` (2º EM A, 1.240 pts → 1.520 no Match Day), Bruno `2026002`, Carla `2026003`. Testes de domínio garantem esse roteiro.

## Comandos
`npm run dev` · `npm test` · `npm run seed` · `npm run corpus` · `npm run embed` · `npm run fallbacks`
