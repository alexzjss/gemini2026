# 03 — Escopo do MVP

Especificação de cada tela, campo a campo: `docs/10-telas.md`. Regras: `docs/07-regras-de-negocio.md`.

## Módulos e histórias

### M0 — Entrada
- **US-01** Na landing, digito minha matrícula (ex.: `2026001`) ou toco em "Sou professor(a) — demo". Matrícula inválida → "Não achamos essa matrícula. Confere com a secretaria?". Atalhos visíveis no modo demo: Kauã, Bruno, Carla.
- **US-02** No primeiro acesso vejo o **consentimento**: que dados usamos (boletim, frequência, respostas), para quê, quem vê (eu e meu professor), que **minhas notas nunca bloqueiam carreira nenhuma** e que conversas com o mentor simulado são com uma IA. "Bora" registra `consentAt`.

### M1 — Ficha BNCC (aba Perfil)
- **US-03** Vejo "Você já manda bem" (dominadas) e "Bora destravar" (defasagem e em desenvolvimento), cada uma com chip do código, área, descrição jovem e barra de progresso com rótulo ("começando", "subiu esta semana").
- **US-04** Vejo meu nível, pontos, a tabela de como ganho pontos e os mentores que destravo por nível (desktop: tudo na mesma tela; mobile: tabela e mentores ficam na aba Missões).
- **US-05** Botão "Ver missões pra essas habilidades".

### M2 — Teste "Da Galera"
- **US-06** 10 cenários, um por tela, opções A–D, botão "Próximo cenário" só depois de escolher; posso sair e continuar depois (progresso salvo). Barra segmentada 10 partes, "7/10".
- **US-07** No desktop, painel "Até agora você curte" atualiza ao vivo.
- **US-08** Resultado: frase-título, barras dos 4 eixos mais fortes, 4 caminhos que combinam, 1 habilidade para destravar, aviso sobre o boletim, +50 pts, botão "Ver carreiras".
- **US-09** Desafio da semana: card no Início com 3 cenários extras (+10) que refinam o perfil.

### M3 — Carreiras (swipe)
- **US-10** Cards de carreira, um por vez: "combina: futebol + números", raio-x de um dia, onde a escola aparece (chip BNCC + frase), botões Passar / Salvar / **Quero conhecer**; arrastar para os lados também funciona. Contador "N salvas".
- **US-11** "Quero conhecer" salva, dá +10 (1x por carreira) e abre o **detalhe**: raio-x, onde a escola aparece com meu status, como chegar, mentores reais da área (disponíveis: "Quero no meu Match Day"; bloqueados: "abre no nível N", nome oculto) e o botão **"Conversar com um mentor simulado"**.
- **US-12** Nenhuma carreira some por causa de nota; "passadas" voltam no fim da fila.

### M4 — Mentor simulado (texto)
- **US-13** Converso por texto com a IA no papel de um profissional da carreira, com legenda "Mentor simulado por IA". Ele propõe um **mini-desafio BNCC** ligado à profissão; se eu explicar bem, ganho +20 (1x por sessão).
- **US-14** Rodapé: "Isso é uma simulação por IA. Um(a) profissional de verdade abre no nível N."

### M5 — Missões
- **US-15** Aba Missões: tabela de pontos, 3 missões sugeridas (a 1ª é a Missão do dia) e mentores por nível com cadeado e "faltam X pts".
- **US-16** Quiz em tela cheia: chip de interesse (trocável), 4 questões, explicação após cada uma, resumo final com pontos ganhos e, se passou, "Você destravou {habilidade} 🔓" e a habilidade sobe de nível.

### M6 — Início e Match Day
- **US-17** Início: "E aí, {nome}.", faltam X pts pro próximo nível, card de nível, Missão do dia, "Continua o Da Galera" (ou desafio da semana), carreiras que combinam (desktop) e card **Match Day** com contagem regressiva.
- **US-18** Modo demo: "Simular fim do semestre" lança as presenças restantes, recalcula o nível e abre a **revelação**: 3‑2‑1, card vira, confete, mentor, "por que deu match" (fatores + texto da IA), 3 perguntas sugeridas e **Agendar conversa** (3 horários fictícios → confirmação).
- **US-19** Se não for elegível, vejo o que falta, de forma encorajadora.

### M7 — Professor
- **US-20** Entro como professor demo e caio no **2º EM A**, com seletor de turma.
- **US-21** Mapa: 4 cards-resumo (maior defasagem, top interesses, alunos em atenção, % que fez o Da Galera), heatmap habilidades × alunos e, por linha, % de defasagem + botão **"Gerar plano"** com o interesse nº 1 da turma pré-selecionado (trocável).
- **US-22** Painel "Vale uma conversa": alunos com sinais e motivos; botão **"Conversei"** com nota → "acompanhando".
- **US-23** Clico num aluno → ficha individual (habilidades, afinidades, nível, carreiras de interesse, match). Sem dados sensíveis além do necessário.
- **US-24** Editor de plano: gerado via RAG; campos editáveis por seção; painel lateral fixo de citações (texto oficial); selo ético; **Aprovar** → vai para "Planos".
- **US-25** O progresso do Kauã no mesmo navegador aparece no mapa ao vivo (a célula de EM13MAT316 muda após a missão).

## Rotas

| Rota | Tela | Design |
|---|---|---|
| `/` | Landing / login | novo |
| `/aluno/consentimento` | Consentimento | novo |
| `/aluno` | Início | `Main`, `D-Inicio` |
| `/aluno/galera` | Da Galera (fluxo) | `M-Teste`, `D-Teste` |
| `/aluno/galera/resultado` | Resultado | `M-Resultado` |
| `/aluno/semana` | Desafio da semana (reusa o fluxo) | derivado |
| `/aluno/carreiras` | Swipe | `M-Carreiras`, `D-Carreiras` |
| `/aluno/carreiras/[id]` | Detalhe da carreira | derivado de `D-Carreiras` |
| `/aluno/carreiras/[id]/mentor-simulado` | Chat | `M-Live` (adaptado para texto) |
| `/aluno/missoes` | Missões | `M-Missoes` |
| `/aluno/missoes/[code]` | Quiz | novo |
| `/aluno/perfil` | Ficha BNCC | `M-Perfil`, `D-Perfil` |
| `/aluno/match` | Match Day (revelação, agenda) | novo |
| `/professor` | Redireciona para `/professor/turma/2A` | — |
| `/professor/turma/[classId]` | Mapa da turma | novo |
| `/professor/turma/[classId]/aluno/[studentId]` | Ficha individual | novo |
| `/professor/plano/[planId]` | Editor do plano | novo |
| `/professor/planos` | Planos aprovados | novo |

Barra demo (só com `NEXT_PUBLIC_DEMO_MODE=1`): faixa fina no topo com "Modo demo", trocar perfil (Kauã/Bruno/Carla/Professor), "Simular fim do semestre", "Resetar dados" e o badge **"IA offline"** quando alguma resposta veio do fallback.

## Fora do escopo (roadmap)
Gemini Live por voz · faixa salarial (Novo CAGED/RAIS) · interface do mentor real e videochamada · Auth e banco reais · integração com secretaria/boletim estadual · atividade gamificada separada e PDF do plano · indicar colega (nível 5) · notificações · painel do gestor.

## Roteiro de demo (≈ 5 min, um navegador só)

| # | Tela | Ação | Fala-chave |
|---|---|---|---|
| 1 | Landing | Matrícula `2026001` | "O Kauã entra só com a matrícula — o boletim já vem da escola." |
| 2 | Consentimento | "Bora" | "Antes de tudo: o que usamos, quem vê, e que nota nunca bloqueia carreira." |
| 3 | Início | Mostrar nível 3, 1.240 pts, faltam 260 | "Pontos vêm de esforço, não de nota." |
| 4 | Da Galera | Responder os 4 cenários restantes | "Sem cara de prova: dilemas do dia a dia." |
| 5 | Resultado | Frase-título, barras, caminhos, EM13MAT316 | "O gosto dele cruza com a ficha BNCC." |
| 6 | Carreiras | Swipe: passar 1, "Quero conhecer" Analista de dados esportivos | "Explora sem compromisso; o que ele curte pesa no match." |
| 7 | Detalhe | Mentor de Big Tech bloqueado (nível 4); "Quero no meu Match Day" na analista do clube | "Os mentores de alta demanda ficam pra quem se dedica." |
| 8 | Mentor simulado | 2 trocas, resolve o mini-desafio da média (+20) | "Enquanto o match não chega, ele treina com um mentor simulado." |
| 9 | Missão do dia | EM13MAT316 com futebol, 3/4 → sobe de nível | "A estatística virou artilharia do interclasse." |
| 10 | Professor | Trocar perfil → 2º EM A | "A Prof.ª Helena vê 70% da turma com defasagem em EM13MAT316 e que a turma curte futebol, games e empreendedorismo." |
| 11 | Mapa | Célula do Kauã mudou ao vivo; alerta do Bruno, "Conversei" | "Sinais de evasão só para ela, com motivo, sem rótulo." |
| 12 | Plano | "Gerar plano" EM13MAT316 × futebol → citações + selo → editar 1 linha → Aprovar | "RAG na BNCC e no Referencial do MEC, com o professor no comando." |
| 13 | Match Day | Voltar ao Kauã → "Simular fim do semestre" → sobe pro nível 4 → revelação | "No fim do semestre, o esforço vira conexão real." |
| 14 | Contraste | Trocar para Carla (nível 1) e Bruno (nível 4) | "Nota alta sozinha não basta; esforço abre portas." |
