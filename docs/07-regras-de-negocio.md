# 07 — Regras de Negócio

Tudo aqui é **determinístico** e vive em `lib/domain/*`. Constantes em `lib/config.ts`.

## 1. Diagnóstico (boletim → SkillStatus)

Para cada habilidade com ≥1 avaliação ligada:

- `media` = média das notas das avaliações que contêm o código.
- Nível base: `media ≥ 7` → `dominada`; `5 ≤ media < 7` → `em_desenvolvimento`; `media < 5` → `defasagem`.
- `tendencia`: média do bimestre 2 − bimestre 1: `> +0,5` subindo, `< −0,5` caindo, senão estável.
- Se existir `skillOverrides[code]` (evolução por missões), ele prevalece sobre o nível base.

**Uso proibido:** o nível nunca é usado para filtrar/ocultar carreiras ou mentores. Ele só alimenta "habilidades para destravar" e o mapa do professor.

## 2. Afinidades (teste vocacional)

- Soma `pesos` de cada opção escolhida por eixo.
- Normaliza: `eixo = round(100 * soma / maxPossivelDoEixo)`.
- Ranking de carreiras: similaridade de cosseno entre `profile` e `career.affinity`. Top 3.
- "Habilidades para destravar" = `career.skills` cujo status do aluno é `defasagem` ou `em_desenvolvimento` (máx. 3). Se todas dominadas → mensagem "Você já tem a base, bora aprofundar".

## 3. Pontos

| Evento | Pontos |
|---|---|
| `vocacional_concluido` | +20 |
| `desafio_concluido` (novo cenário periódico) | +20 |
| `missao_concluida` (qualquer resultado) | +30 |
| `habilidade_evoluiu_defasagem` (defasagem → em desenvolvimento) | **+80** |
| `habilidade_evoluiu_desenvolvimento` (em desenvolvimento → dominada) | +50 |
| `frequencia_semanal` (semana com ≥ 75%) | +10 |
| Nota alta absoluta | **+0** (de propósito) |

- Missão "passa" com acertos ≥ 70% → a habilidade sobe 1 nível (no máx. 1 nível por habilidade a cada missão).
- Repetir missão da mesma habilidade no mesmo dia: só `missao_concluida` conta 1 vez/dia por habilidade (anti-farm).
- `pontos = pontosSeed + Σ eventos locais`.

## 4. Tiers

| Tier | Pontos | Mentores acessíveis |
|---|---|---|
| Bronze | 0–299 | Bronze (ex-alunos, profissionais locais, universitários) |
| Prata | 300–699 | Bronze + Prata (profissionais de mercado) |
| Ouro | 700+ | Todos, incluindo alta demanda (Big Tech, médicos especialistas, executivos) |

UI mostra sempre "faltam X pontos para Prata" e **como** ganhar (missões nas suas habilidades em defasagem rendem mais).

## 5. Match Day

### Elegibilidade (todos obrigatórios)

1. `vocacionalConcluido = true`
2. `missoesConcluidas ≥ 1`
3. `frequenciaMedia ≥ 60%`

Se não elegível → `faltaPara[]` com mensagens encorajadoras. (No modo demo, o botão ainda roda para mostrar o estado.)

### Score aluno × mentor (0–100)

Somente mentores com `tier ≤ tier do aluno` e `vagasSemestre > 0`.

```
score = 45 * afinidade      // cosseno(student.affinity, mentor.affinity)
      + 25 * carreira       // 1 se mentor.careerIds ∩ topCareerIds ≠ ∅ (1º lugar = 1, 2º = 0.8, 3º = 0.6), senão 0
      + 20 * evolucao       // min(1, nº habilidades que subiram de nível no semestre / 3)
      + 10 * engajamento    // min(1, missoesConcluidas / 5) * 0.5 + min(1, frequenciaMedia/100) * 0.5
```

- Vence o maior score; empate → mentor de tier mais alto → mais vagas.
- Resposta inclui `fatores` (cada parcela) para transparência; o Gemini usa esses números para escrever a justificativa e 3 perguntas sugeridas para a conversa.
- `evolucao` e `engajamento` medem esforço, não nota — coerente com "meritocracia por esforço".

## 6. Sinais de atenção (evasão) — só professor

Cada sinal gera um motivo legível. Status do aluno: `ok` (0 sinais), `atencao` (1), `prioridade` (≥ 2).

| Sinal | Regra |
|---|---|
| Frequência baixa | média das últimas 4 semanas < 75% |
| Queda de frequência | últimas 2 semanas ≤ média das 6 anteriores − 15 p.p. |
| Inatividade na plataforma | `ultimoAcessoDiasAtras ≥ 14` |
| Notas em queda | ≥ 2 habilidades com `tendencia = "caindo"` |

Regras de exibição: sem score numérico de "risco"; texto "Vale uma conversa" + motivos; nunca exibido ao aluno; não entra no prompt do Gemini; não afeta pontos nem match.

## 7. Agregados da turma

- **Defasagem por habilidade:** `% alunos com level = defasagem` (ordenado desc.).
- **Top interesses:** contagem de `career.tags` das top 3 carreiras de cada aluno (alunos sem vocacional usam `vocacionalSeed`), top 5.
- **Distribuição de tiers** e **% que completou vocacional**.
