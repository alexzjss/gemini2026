# 07 — Regras de Negócio

Tudo aqui é **determinístico**, vive em `lib/domain/*` e é coberto por Vitest. Constantes em `lib/config.ts`. A IA nunca decide nada desta lista — só redige textos.

## 1. Diagnóstico (boletim → SkillStatus) — `domain/diagnostico.ts`

Para cada habilidade com ≥ 1 avaliação ligada:

- `media` = média simples das notas das avaliações que contêm o código.
- Nível base: `media ≥ 7,0` → `dominada`; `5,0 ≤ media < 7,0` → `em_desenvolvimento`; `media < 5,0` → `defasagem`.
- `tendencia` = média do bimestre 2 − média do bimestre 1: `> +0,5` subindo · `< −0,5` caindo · senão estável. Só um bimestre → estável.
- `skillOverrides[code]` (evolução por missões) **prevalece** sobre o nível base.
- `progresso` (0–100, barra da ficha): `defasagem` = `media*10` limitado a 45; `em_desenvolvimento` = 50 + (media−5)*12; `dominada` = 100. Missões aprovadas somam +15 (máx. 95 antes de subir de nível).
- Rótulo da barra na ficha: "começando" (< 30), "em desenvolvimento" (30–69), "subiu esta semana" (se houve evolução nos últimos 7 dias).

**Proibido:** usar o nível para esconder, filtrar ou reordenar carreiras ou mentores. Ele só alimenta "habilidades para destravar", sugestão de missões e o mapa do professor.

## 2. Afinidades — `domain/afinidades.ts`

Eixos (`AffinityAxis`):

| id | Rótulo |
|---|---|
| `analisar` | Organizar e analisar |
| `tech` | Tecnologia e games |
| `criar` | Criar e comunicar |
| `cuidar` | Cuidar e ensinar |
| `negocios` | Negócios e liderança |
| `esportes` | Esportes, corpo e natureza |

- Cada opção de cenário tem `pesos` (0–3) em 1–3 eixos.
- `bruto[eixo] = Σ pesos escolhidos` (10 cenários do Da Galera + cenários do desafio da semana).
- `perfil[eixo] = round(100 * bruto / maxPossivel[eixo])`, onde `maxPossivel` = soma do maior peso desse eixo em cada cenário respondido.
- Rótulo da barra: `≥ 65` forte · `35–64` médio · `< 35` leve. Resultado mostra os **4 maiores** eixos.
- Parcial ("Até agora você curte", desktop): mesmo cálculo com os cenários respondidos, top 3, a partir do 3º cenário.
- **Frase-título** (`fraseTitulo(perfil)`): tabela fixa pelo par dos 2 maiores eixos (15 pares) — ex.: `analisar+esportes` → "Você curte organizar o caos com números."; `tech+criar` → "Você transforma ideia em coisa que funciona na tela." Tabela completa em `data/seed/frases.json`. Determinística (não usa IA).

## 3. Ranking de carreiras — `domain/carreiras.ts`

- `similaridade = cosseno(perfil, career.affinity)`.
- Bônus: `+0,15` se a carreira está salva, `+0,25` se "Quero conhecer". Penalidade: carreira "passada" vai para o fim da fila do swipe (nunca some — reaparece depois das outras).
- **Caminhos que combinam** (resultado do Da Galera): top 4 por similaridade.
- **Fila do swipe**: todas as 15, ordenadas por score; rótulo "N de M hoje" mostra 5 por dia (as demais continuam acessíveis com "Ver mais").
- `combina:` (texto do card) = rótulos curtos dos 2 eixos com maior `perfil[eixo] * career.affinity[eixo]` (ex.: "futebol + números" vem do campo `career.combinaCom[eixo]`).
- **Onde a escola aparece**: 1ª habilidade de `career.skills` que o aluno não domina (se todas dominadas, a 1ª da lista) + `career.escola[code]` (frase curta) + status do aluno nessa habilidade.
- **Habilidade para destravar** (resultado): a mesma regra aplicada à carreira nº 1.

## 4. Pontos — `domain/pontos.ts`

| Evento (`PointEventType`) | Pontos | Limite |
|---|---|---|
| `galera_concluido` | +50 | 1x |
| `desafio_semana` | +10 | 1x por semana |
| `carreira_explorada` (Quero conhecer) | +10 | 1x por carreira |
| `missao_concluida` | +30 | 1x por habilidade por dia |
| `missao_aprovada` (≥ 3 de 4 acertos) — "evoluir" | +40 | 1x por habilidade por dia |
| `habilidade_subiu` (mudou de nível) | +40 | 1x por transição |
| `presenca_semana` (semana com frequência ≥ 75%) | +15 | 1x por semana |
| `mini_desafio_mentor` | +20 | 1x por sessão de mentor simulado, máx. 3/dia |
| Nota alta absoluta | **+0** | — |

- `pontos = pontosSeed + Σ eventos locais`.
- Subida de nível de habilidade: a cada **missão aprovada**, a habilidade sobe 1 nível (`defasagem → em_desenvolvimento → dominada`). Máximo 1 subida por habilidade por dia.
- Missão concluída com < 3 acertos: ganha só os +30 e mensagem "Bora de novo amanhã — cada tentativa conta".

Na tela de Missões, a tabela exibida ao aluno é: **+40** evoluir no que você ainda não domina · **+30** completar uma missão BNCC · **+15** semana com presença em dia · **+10** explorar carreiras e o Da Galera. (O +50 do Da Galera e o +40 extra de subida aparecem nos toasts.)

## 5. Níveis — `domain/niveis.ts`

| Nível | Nome | Pontos | Abre |
|---|---|---|---|
| 1 | Começando | 0 | Mentores **profissionais da sua região** |
| 2 | Na Pista | 300 | Mentores **universitários e técnicos** |
| 3 | Embalado | 700 | Mini-desafios extras do mentor simulado (3/dia em vez de 1) |
| 4 | Destravado | 1.500 | Mentores de **alta demanda** (Big Tech, medicina, executivos) |
| 5 | Referência | 2.500 | Selo "Referência" + pode indicar um colega para o Match Day (roadmap; no MVP só o selo) |

- `faltam = proximoLimite − pontos`; barra = `(pontos − limiteAtual) / (proximoLimite − limiteAtual)`; o rótulo "1.240 / 1.500" usa o **próximo limite** como denominador.
- Texto do Início: "Faltam **{faltam} pontos** pro nível {n+1}, que abre {o que abre}."
- Mentor `nivelMinimo` ∈ {1, 2, 4}.

## 6. Match Day — `domain/match.ts`

### "Simular fim do semestre" (modo demo)
1. Marca `semestreSimulado = true`.
2. Lança `presenca_semana` para as semanas restantes do semestre (semanas 9–16) em que a frequência projetada do aluno (`frequenciaProjetada`, campo do seed) é ≥ 75%.
3. Recalcula pontos e nível → roda a elegibilidade e o score.

> Kauã no roteiro: 1.240 (seed) + 50 (Da Galera) + 110 (missão aprovada que sobe nível) + 10 (Quero conhecer) + 20 (mini-desafio) = 1.430; + 6 semanas × 15 = **1.520 → nível 4 no próprio Match Day**. Momento de virada da demo.

### Elegibilidade (todos obrigatórios)
1. Da Galera concluído.
2. ≥ 1 missão concluída no semestre (`missoesConcluidas`, seed + local).
3. Frequência média do semestre ≥ 60%.

Não elegível → `faltaPara[]` encorajador ("Termina o Da Galera — faltam 4 cenários"). No modo demo a tela mostra esse estado.

### Score aluno × mentor (0–100)
Candidatos: mentores com `nivelMinimo ≤ nível do aluno` e `vagasSemestre > 0`.

```
score = 40 * afinidade      // cosseno(perfil, mentor.affinity)
      + 25 * carreira       // melhor valor entre as carreiras do mentor:
                            //   Quero conhecer = 1,0 · salva = 0,8 · top 4 do resultado = 0,6 · senão 0
      + 10 * preferencia    // 1 se o aluno marcou "Quero no meu Match Day" nesse mentor
      + 15 * evolucao       // min(1, habilidades que subiram de nível no semestre / 3)
      + 10 * engajamento    // 0,5*min(1, missoes/5) + 0,5*min(1, frequenciaMedia/100)
```

- Vence o maior score; empate → maior `nivelMinimo` → mais vagas → ordem alfabética do id.
- Resposta traz `fatores` (cada parcela, já multiplicada) para transparência e para o Gemini redigir o porquê.
- `evolucao` e `engajamento` medem **esforço**, não nota.

### Agendar conversa
3 horários fictícios gerados a partir de `mentor.disponibilidade` (ex.: "Ter 14h", "Qui 10h", "Sáb 9h"). Ao confirmar: `match.agendadoPara` no localStorage + tela "Combinado! Você recebe o link na escola." Sem chamada externa.

## 7. Sinais de atenção (evasão) — `domain/evasao.ts` — só professor

| Sinal | Regra | Texto exibido |
|---|---|---|
| Frequência baixa | média das últimas 4 semanas < 75% | "Frequência de {x}% nas últimas 4 semanas" |
| Queda de frequência | média das 2 últimas ≤ média das 6 anteriores − 15 p.p. | "Frequência caiu {d} pontos nas últimas 2 semanas" |
| Inatividade | `ultimoAcessoDiasAtras ≥ 14` (zera se o aluno entrou no navegador demo) | "Sem entrar na plataforma há {n} dias" |
| Notas em queda | ≥ 2 habilidades com `tendencia = caindo` | "Queda em {n} habilidades do 1º para o 2º bimestre" |

Status: `ok` (0) · `atencao` (≥ 1). Se o professor registrou **"Conversei"** → `acompanhando` (mostra data e nota), até surgir um sinal **novo**.

Regras: sem número de "risco"; texto "Vale uma conversa"; nunca aparece para o aluno; não vai ao Gemini; não afeta pontos nem match.

## 8. Missões sugeridas — `domain/missoes.ts`

**Missão do dia** (`missaoDoDia()`): 1ª habilidade **não dominada** da lista `skills` da carreira nº 1 do aluno (Quero conhecer > salva > top 1 do resultado). Antes de concluir o Da Galera, a carreira nº 1 vem do perfil parcial (ou da 1ª defasagem, se não houver perfil).

Ordem das outras 2 sugestões (excluindo a missão do dia):
1. Habilidades em `defasagem` que aparecem em `skills` das carreiras **Quero conhecer/salvas** (ou top 4, se nenhuma).
2. Demais `defasagem`.
3. `em_desenvolvimento` ligadas às carreiras.
Desempate: menor `progresso`. Excluir habilidades já feitas hoje.

Cada missão tem título fixo do seed (`data/seed/missoes.json`, ex.: EM13MAT316 → "Quem é o artilheiro de verdade? Média, moda e mediana no interclasse", 8 min) e o **quiz é gerado na hora** pela IA no interesse escolhido (padrão: tag principal da carreira nº 1).

## 9. Agregados da turma — `domain/turma.ts`

- **Heatmap:** linhas = habilidades (ordenadas por % defasagem desc.), colunas = alunos (ordem alfabética), célula = nível.
- **% defasagem por habilidade.**
- **Top interesses:** soma de `career.tags` das carreiras Quero conhecer (peso 3), salvas (2) e top 4 do resultado (1) de cada aluno; top 5.
- **Cards-resumo:** maior defasagem (código + %), top 3 interesses, nº de alunos em `atencao`, % que concluiu o Da Galera.
- **Matches:** lista aluno → área do mentor (quando houver).
