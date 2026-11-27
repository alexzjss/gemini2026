# 01 — Contexto do Produto

## Problema

Existe um abismo entre **o que o aluno estuda na escola** e **o futuro que ele enxerga para si**. Sem ver sentido prático, o estudante se desengaja — e o desengajamento é a porta de entrada da evasão. Do outro lado, o professor não tem dados acionáveis sobre *quais habilidades* a turma não domina nem *o que motiva* aqueles alunos.

## Persona principal — Aluno

- 1º ao 3º ano do Ensino Médio, rede pública.
- 14–18 anos, acessa principalmente pelo **celular** (às vezes básico, rede 3G/4G instável) ou no laboratório da escola.
- Pouco contato com profissionais fora do seu círculo; referências vêm de cultura pop, esportes, games, redes sociais.
- Rejeita qualquer coisa com "cara de prova".

**Jobs to be done:** "Quero entender pra que serve o que eu estudo", "Quero descobrir o que eu curto e se isso vira profissão", "Quero falar com alguém que trabalha com isso".

## Persona secundária — Professor

- Leciona em várias turmas, pouco tempo de planejamento.
- Precisa alinhar aulas à BNCC e justificar escolhas pedagógicas.
- **Jobs:** "Saber onde minha turma está travada", "Ter um plano de aula contextualizado pronto para revisar", "Saber quem está sumindo antes que abandone".

## Persona terciária — Mentor (fora da UI no MVP)

Profissional voluntário (de ex-aluno local a engenheiro de Big Tech). No MVP existe apenas como dado no seed e como resultado do Match.

## Proposta de valor

| Para | Entrega |
|---|---|
| Aluno | Descobre interesses de forma leve, vê quais habilidades destravam esses caminhos e ganha um marco concreto (Match Day) que recompensa esforço. |
| Professor | Mapa da turma cruzando defasagens BNCC × interesses × sinais de evasão, e plano de aula com citações oficiais em um clique. |
| Mentor | Tempo voluntário direcionado a jovens engajados e preparados. |

## Princípios inegociáveis (Referencial de IA na Educação / LGPD / ECA)

1. **Boletim não é destino.** O boletim é só diagnóstico do ponto de partida. **Nenhuma carreira é bloqueada ou escondida** por causa de notas; o sistema mostra o que destravar, nunca "isso não é pra você".
2. **Meritocracia por esforço, não por exclusão.** A pontuação premia evolução nas próprias fragilidades, missões e frequência — não nota absoluta. Quem melhora sobe mais rápido do que quem já era bom.
3. **Human-in-the-loop.** Todo plano de aula é revisado, editável e aprovado pelo professor antes de existir "oficialmente".
4. **Algoritmos auditáveis.** Match e alerta de evasão são regras determinísticas e transparentes; a IA só redige explicações.
5. **Sem rótulos.** Risco de evasão é visível apenas ao professor, como "atenção" com motivos — nunca exibido ao aluno nem como etiqueta permanente.
6. **Consentimento.** Tela de entrada explica, em linguagem jovem, quais dados são usados e para quê.
7. **Fundamentação.** Conteúdo pedagógico gerado cita os trechos da BNCC/Referencial usados (RAG).

## Tom de voz

- **Aluno:** jovem, direto, acolhedor, emojis moderados, sem gíria forçada e nunca infantil. Ex.: "Bora descobrir seu rolê?", "Você destravou uma habilidade nova 🔓".
- **Professor:** técnico-pedagógico, objetivo, com códigos BNCC explícitos.

## Métricas de sucesso (para o pitch)

- % de alunos que completam o Da Galera e ≥ 1 missão.
- Nº de habilidades que saem de "defasagem" no semestre.
- % de alunos que chegam ao Match Day.
- Nº de planos de aula aprovados pelo professor.
- Queda de alunos com alerta de evasão ativo.
