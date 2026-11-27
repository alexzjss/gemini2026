# UI do professor (F8 · Agente 5)

Telas de `docs/10` §14–17: mapa da turma, ficha individual, editor de plano e lista de planos.

| Rota | Componente |
|---|---|
| `/professor` | redireciona para `/professor/turma/2A` |
| `/professor/turma/[classId]` | `TurmaMapa` (SummaryCards, SkillHeatmap, DefasagemBars, GerarPlanoPopover, AttentionList) |
| `/professor/turma/[classId]/aluno/[studentId]` | `StudentProfile` |
| `/professor/plano/[planId]` | `PlanEditor` (CitationsPanel, EthicsSeal) |
| `/professor/planos` | `PlanList` |

## Dependências de outros agentes

- **Agente 1:** `lib/types.ts` (tipos de `docs/05`), `lib/config.ts` (`APP_NAME`), `app/layout.tsx` com ThemeRegistry e as fontes (`--font-bricolage`, `--font-inter`), pacotes `@mui/material`, `@mui/icons-material`, `@mui/x-charts`.
- **Agente 3:** `POST /api/plano-aula` com o contrato de `docs/04` (`{ data: LessonPlan, source }`). O cliente está em `api.ts`.

## Ponto de integração: `dados/fonte.ts`

Todas as telas leem e escrevem só pelos hooks de `dados/fonte.ts`, que usam o AppStore (`state.planos`, `savePlan`, `approvePlan`, `reopenPlan`, `markConversation`) e os selectors/domínio (`useClassView`, `studentView`, `domain/evasao`). O professor lê o mesmo `localStorage` do aluno, então o progresso aparece ao vivo. O "Conversei" guarda os `tipos` de sinal vistos; um sinal novo reabre o alerta.

## Outras notas

- `cores.ts` reexporta os tokens e a fonte de `lib/theme.ts`.
- `Stack.tsx` é um flex local: o MUI 9 tirou as props `gap`/`alignItems` do `Stack`, e assim o código funciona no MUI 7, 8 ou 9.
- O pedido à IA leva só código BNCC, interesse, distribuição de níveis e nº de alunos. O campo de observações remove e-mails e números longos antes de enviar.
- As citações são exibidas exatamente como a rota devolve; esta UI nunca escreve texto da BNCC ou do Referencial.
