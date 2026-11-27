# 08 — Plano de Implementação (2 horas)

Premissa: time de 3–5 pessoas (ajuste se for menor; com 1–2 pessoas, corte na ordem da seção "Cortes").

## Cronograma

| Tempo | Entrega | Responsável sugerido |
|---|---|---|
| 0:00–0:15 | `create-next-app` (TS, Tailwind, App Router), `lib/types.ts`, `lib/config.ts`, `useAppStore`, layout com topbar/modo demo, deploy vazio na Vercel com `GEMINI_API_KEY` | Pessoa A |
| 0:00–0:40 | **Seed** completo (`data/seed/*`) seguindo a distribuição de `05` | Pessoa B (pode usar o Gemini para gerar e revisar) |
| 0:00–0:40 | **Corpus** BNCC + Referencial (texto literal), `embed-corpus.ts`, `retriever.ts` | Pessoa C |
| 0:15–0:45 | `lib/domain/*` (diagnóstico, afinidades, pontos, tiers, match, evasão, turma) | Pessoa A |
| 0:15–0:45 | `lib/ai/gemini.ts` + prompts + 5 API routes com fallback `default` | Pessoa D |
| 0:45–1:20 | **UI aluno**: landing, consentimento, dashboard, ficha, vocacional, missão, match | A + B |
| 0:45–1:20 | **UI professor**: turmas, mapa, alertas, ficha individual, gerador/editor de plano, aprovados | C + D |
| 1:20–1:35 | Fallbacks dos heróis (rodar rotas e salvar saídas) | D |
| 1:35–1:50 | Ensaio do roteiro de demo (`03`), correções, responsividade no celular | Todos |
| 1:50–2:00 | Deploy final, teste com API desligada (fallback), congelar | A |

## Definição de pronto

- [ ] Roteiro de demo de `03` roda inteiro no celular e no desktop.
- [ ] Roda com `GEMINI_API_KEY` ausente (fallbacks) sem erro visível além do badge.
- [ ] Nenhum texto sugere que o aluno "não pode" seguir uma carreira.
- [ ] Plano de aula mostra citações com texto real dos chunks.
- [ ] Alerta de evasão aparece só no painel do professor.
- [ ] "Resetar dados demo" funciona.

## Cortes (se o tempo apertar, nesta ordem)

1. Ficha individual do aluno no painel do professor.
2. Lista "Planos aprovados" (manter só o estado aprovado no editor).
3. Missão gerada por IA → usar só o quiz do fallback.
4. Embeddings → retriever só por palavra-chave/código (continua citando).
5. Resumo IA da ficha BNCC → texto do fallback.

Nunca cortar: consentimento, regra "carreiras nunca bloqueadas", Match Day, plano com citações + aprovação.
