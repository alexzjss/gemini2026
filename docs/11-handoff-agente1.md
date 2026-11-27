# 11 — Handoff do Agente 1 (F1, F5.1, F7, F9.2–F9.5)

## O que está pronto
- **F1** Next 15 + TS strict + MUI 7 (tema em `lib/theme.ts`, tokens de `09`), fontes `next/font`, contrato 1 (`lib/types.ts`, `lib/config.ts`), store (`lib/store/local.ts`, `AppStore.tsx` com todas as ações de `04`), shells, DemoBar, OfflineBadge, rotas placeholder. Modo demo **ligado por padrão** (`NEXT_PUBLIC_DEMO_MODE=0` desliga).
- **F5.1** `components/ui/` (importe de `@/components/ui`): InkCard, LimeCard, SurfaceCard, PillButton (`href` vira link), PointsPill/`formatPontos`, BnccChip, SegmentedProgress (`onBlue`/`onLight`), LevelBar, AffinityBar, OptionCard (`role="radio"`, use num `radiogroup`), Avatar (`locked`), LockedMentor, PointsToast (global), Overline, LoadingState, ErrorState.
- **F7** `/aluno/carreiras/[id]/mentor-simulado` e `/aluno/match`. `MatchDayCard` em `app/aluno/match/_components/MatchDayCard.tsx` — **Agente 4: use no Início** (`<MatchDayCard view={view} />`).
- **F9.3** `app/error.tsx`, `global-error.tsx`, `not-found.tsx`. **F9.4** roteiro roda sem `GEMINI_API_KEY`. **F9.5** Lighthouse mobile: acessibilidade 100 em `/`, `/aluno`, `/aluno/match` e mentor simulado; axe sem violações (consentimento, chat, revelação, diálogo).

## Convenções do store
- `useAppStore()` → `{ state, ui, dispatch }`; `useActions()` → `{ dispatch, now, resetDemo }`; `useSessionStudentId()`.
- Pontos: só pelas ações (`finishGalera`, `swipe want`, `finishMission`, `awardMiniChallenge`, `simulateSemester`, `finishSemana`); o reducer valida limites e dispara o toast.
- IA no cliente: `useApi()` de `lib/store/api.ts` (timeout, nunca lança, fallback local, acende "IA offline").

## Provisórios para os donos substituírem (mesma assinatura)
| Arquivo | Dono | Observação |
|---|---|---|
| `data/seed/*.json` | Agente 2 | 3 heróis, 15 carreiras, 12 mentores, 16 habilidades, missões. `scenarios.json` e `frases.json` vazios → afinidade do Kauã fica 0 no match até existirem |
| `lib/domain/{niveis,pontos,afinidades,diagnostico,match}.ts` | Agente 2 | Fórmulas de `07`, sem testes unitários próprios |
| `lib/store/selectors.ts` | Agente 2 | Só os campos usados por shells e F7 |
| `app/api/match`, `app/api/mentor-simulado`, `data/fallbacks/{match,mentor}.json` | Agente 3 | Só fallback. Mentor aceita `desafioResolvido?: boolean` extra; roteiro offline em `app/aluno/carreiras/[id]/mentor-simulado/_components/offline.ts` |

Teste de aceite do F7: `lib/domain/__tests__/roteiro-match.test.ts` (1.240 → 1.430 → 1.520, nível 4, match com `m01-renata`).
