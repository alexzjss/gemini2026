# 11 — Grafo Educacional, Trilha Adaptativa e GraphRAG

Decisão: **D63**. Grafo em memória, sem Neo4j no MVP (mantém D06/D07 e a demo offline). O modelo é o mesmo de um property graph, para migrar sem retrabalho.

## Onde está

| Arquivo | Conteúdo |
|---|---|
| `data/grafo/grafo.json` | Competências, pré-requisitos (com peso), conteúdos e conceitos |
| `data/grafo/alunos-teste.json` | 2 estados de aluno para testes (Kauã `s001`, Bruno `s002`) |
| `lib/grafo/` | Tipos + validação, domínio, trilha, contexto do grafo. Puro: roda no cliente e no servidor |
| `lib/rag/graphrag.ts` | Junta o contexto do grafo com o texto literal da BNCC (corpus) |
| `app/api/mentor-simulado` | Usa o GraphRAG quando a tela envia `estadoGrafo` |

## Modelo

| Property graph | Aqui |
|---|---|
| `(:Competencia {codigo, titulo, area_bncc, eixo_tematico, dificuldade})` | `competencias[]` (+ `bncc`: código oficial ou competência-base `BASE-*` da curadoria) |
| `(:Conteudo {id, tipo, titulo, resumo})` | `conteudos[]` (+ `minutos`, `rota`) |
| `(:Conceito {nome, definicao_curta})` | `conceitos[]` (definição da plataforma, não texto oficial) |
| `-[:PRE_REQUISITO_DE {peso}]->` | `prerequisitos[] { de, para, peso }` (peso ≥ 0,7 = bloqueante) |
| `-[:TRABALHA]->`, `-[:EXPLICA]->` | `conteudo.trabalha[]`, `conteudo.explica[]` |
| `(:Aluno)-[:DOMINA {score, tentativas, ultima_pratica}]->` | `EstadoAluno.dominio` (localStorage) |
| `(:Aluno)-[:RESPONDEU {correto, modo, criado_em}]->` | `EstadoAluno.respostas` (últimas 200) |

O carregamento valida schema, referências, unicidade e **ausência de ciclos**; um grafo inválido não sobe.

## Regras (determinísticas, nunca da IA)

- **Domínio:** `score ← score + α·(alvo − score)`; alvo 1 (acerto) ou 0 (erro); α prática 0,30 · quiz 0,25 · flashcard 0,15 · estudo 0,10 (estudo nunca derruba, teto 0,6). Status: < 0,4 começando · 0,4–0,7 em desenvolvimento · ≥ 0,7 dominada. Ponto de partida: o nível do boletim (`lib/domain`) ou 0,3.
- O score do grafo é um sinal fino para a trilha e o tutor. **O nível oficial da habilidade continua em `lib/domain`** (ficha, mapa do professor, pontos).
- **Lacunas:** pré-requisitos até 3 saltos que o aluno não domina, em ordem topológica (o mais fundamental primeiro). Não atravessa o que já é dominado; alvo dominado → sem lacunas.
- **Próximo passo:** 1ª lacuna (ou o alvo) + conteúdo pelo desempenho: sem prática ou errando → aula; < 0,4 → flashcard; 0,4–0,7 → quiz; ≥ 0,7 → atividade prática. Não repete conteúdo acertado nas últimas 24h. O motivo é mostrado ao aluno, sem rotulá-lo.

## GraphRAG

1. Âncoras na pergunta: códigos citados → conceitos citados → títulos com ≥ 2 palavras em comum. Sem âncora, contexto vazio.
2. Expansão: pré-requisitos pendentes do aluno + conceitos dos conteúdos.
3. Evidência: texto **literal** da BNCC dos códigos oficiais (busca exata no corpus).
4. Prompt: bloco `<grafo>` (status em palavras, sem score, sem nome/id) + `<contexto>`. O mentor começa pelo pré-requisito pendente com pergunta/pista, nunca a resposta pronta.

Segurança: entrada `estadoGrafo` validada (códigos por regex, ≤ 30 respostas); a pergunta só é tokenizada para achar âncoras; `<grafo>` é tratado como dado (regra 7 do system prompt).

## Pendências de integração

- **Agente 1:** `LocalState.porAluno[id].grafo: EstadoAluno` + ação `registrarInteracao`; enviar `estadoGrafo` recortado no chat do mentor.
- **Agente 2:** chamar `registrarResposta` em `finishMission` (quiz) e incluir EM13MAT104, EM13MAT203 e EM13MAT303 no seed se as missões de educação financeira entrarem.
- **P2:** conferir no PDF da BNCC os códigos EM13MAT104, EM13MAT203 e EM13MAT303 e colar o texto literal no corpus.
- **P3:** revisar pré-requisitos, pesos e definições de conceitos.

## Roadmap: Neo4j

Mesmo modelo. Migração = exportar `grafo.json` e os estados para Cypher idempotente:

```cypher
CREATE CONSTRAINT aluno_id IF NOT EXISTS FOR (a:Aluno) REQUIRE a.id IS UNIQUE;
CREATE CONSTRAINT competencia_codigo IF NOT EXISTS FOR (c:Competencia) REQUIRE c.codigo IS UNIQUE;
CREATE CONSTRAINT conteudo_id IF NOT EXISTS FOR (c:Conteudo) REQUIRE c.id IS UNIQUE;
CREATE INDEX aluno_tenant IF NOT EXISTS FOR (a:Aluno) ON (a.tenantId);

UNWIND $competencias AS c
MERGE (n:Competencia {codigo: c.codigo})
SET n += c;

UNWIND $prerequisitos AS e
MATCH (a:Competencia {codigo: e.de}), (b:Competencia {codigo: e.para})
MERGE (a)-[r:PRE_REQUISITO_DE]->(b) SET r.peso = e.peso;
```

Consultas sempre parametrizadas (`$alunoId`, `$tenantId`), com `tenantId` em `:Aluno` e em toda consulta que parte dele. As regras de `lib/grafo` continuam como fonte de verdade; o Neo4j vira armazenamento e travessia.
