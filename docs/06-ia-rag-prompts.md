# 06 — IA, RAG e Prompts

## Cliente (`lib/ai/gemini.ts`)

```ts
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export async function generateJson<T>(o: {
  system: string; user: string;
  responseSchema: object;            // subset OpenAPI aceito pelo Gemini
  zod: z.ZodType<T>;
  fallback: () => T;
  temperature?: number;              // padrão 0.6
  postprocess?: (t: T) => T;         // ex.: sanear citações
}): Promise<{ data: T; source: "ai" | "fallback" }> {
  if (!ai) return { data: o.fallback(), source: "fallback" };
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    try {
      const res = await withTimeout(15_000, (signal) => ai.models.generateContent({
        model: MODEL,
        contents: o.user,
        config: {
          systemInstruction: o.system,
          responseMimeType: "application/json",
          responseSchema: o.responseSchema,
          temperature: o.temperature ?? 0.6,
          abortSignal: signal,
          thinkingConfig: { thinkingBudget: 0 },   // latência baixa na demo
        },
      }));
      const parsed = o.zod.safeParse(JSON.parse(res.text ?? ""));
      if (parsed.success) return { data: o.postprocess ? o.postprocess(parsed.data) : parsed.data, source: "ai" };
    } catch { /* tenta de novo / cai no fallback */ }
    await sleep(500);
  }
  return { data: o.fallback(), source: "fallback" };
}
```

Temperaturas: diagnóstico 0.5 · galera 0.6 · missão 0.7 · mentor 0.8 · match 0.6 · plano 0.4.

## System prompt base (`prompts/system.ts`)

```
Você é a IA da plataforma {APP_NAME}, usada por estudantes do Ensino Médio da rede
pública brasileira (14 a 18 anos) e por seus professores.
Regras fixas:
1. Responda em português do Brasil e SOMENTE no JSON pedido.
2. Nunca diga nem sugira que o estudante não pode seguir uma carreira por causa de notas.
   Notas mostram o ponto de partida, não o destino.
3. Não rotule estudantes. Fale de habilidades, nunca de "aluno fraco" ou "com dificuldade".
4. Com estudantes, estimule o pensamento: faça perguntas e dê pistas, não entregue tudo pronto.
5. Sobre conteúdo curricular, use apenas o que estiver em <contexto>. Se faltar, diga menos.
6. Nunca peça nem mencione dados pessoais (nome completo, endereço, telefone, redes sociais).
```

Tom **aluno** (acrescentado nas rotas de aluno): "Fale como um(a) amigo(a) mais velho(a) que trabalha na área: direto, acolhedor, frases curtas, sem gíria forçada, no máximo 1 emoji por texto. Nunca infantil."
Tom **professor**: "Linguagem técnico-pedagógica, objetiva, com códigos BNCC explícitos."

## Prompts por rota

### `/api/diagnostico` (aluno)
```
Estudante do {serie}º ano do EM. Habilidades (código, situação, descrição):
{lista}
Gere JSON:
- resumo: até 2 frases sobre o momento dele(a) na escola, começando pelo que ele(a) já domina.
- destaques: 2 frases curtas sobre habilidades dominadas.
- proximosPassos: 2 frases curtas, cada uma sobre uma habilidade a destravar, com um motivo prático.
```
Schema: `{ resumo: string, destaques: string[2], proximosPassos: string[2] }`.

### `/api/galera` (aluno)
O servidor já calculou perfil, top 4 e a habilidade a destravar (regras `07 §2–3`).
```
Perfil de afinidades (0–100): {perfil com rótulos}
Caminhos escolhidos pelo algoritmo (não mude): {top4: id, nome, raio-x}
Habilidade a destravar: {code} — {descricaoJovem} — situação: {status}
Gere JSON:
- porQueCombina: para cada id, 1 frase (≤ 120 caracteres) ligando o caminho às afinidades.
- destravarTexto: 1 frase (≤ 140 caracteres) no formato "Pra chegar lá, destrava <termo>: <como aparece na profissão>."
```

### `/api/missao` (aluno) — RAG `retrieve(skillCode, { k: 1, sources: ["bncc"] })`
```
<contexto>[1] {ref} — {texto oficial}</contexto>
Crie um quiz de exatamente 4 questões de múltipla escolha sobre a habilidade [1],
para o {serie}º ano do EM, ambientado em "{interesse}" (situações reais desse universo:
ex. futebol → gols, passes, artilharia do interclasse).
Cada questão:
- enunciado: situação concreta, até 280 caracteres, números pequenos (conta de cabeça ou papel).
- alternativas: 4 opções curtas, uma única correta, distratores plausíveis.
- correta: índice 0–3 (varie a posição entre as questões).
- explicacao: passo a passo em até 3 frases, que ensina o conceito (sem só repetir a resposta).
Progressão: questão 1 fácil → 4 desafiadora.
titulo: até 60 caracteres, divertido, ligado ao interesse.
```
Validação extra: 4 questões, 4 alternativas distintas, `correta` ∈ 0–3, nenhuma alternativa vazia.

### `/api/mentor-simulado` (aluno) — RAG `retrieve(skillCode, { k: 1 })`
```
Você interpreta um(a) {careerNome} brasileiro(a) com 6 anos de experiência, conversando por
texto com um estudante do {serie}º ano do EM que está explorando a profissão.
Você é uma SIMULAÇÃO por IA e, se perguntarem, diz isso.
Rotina típica: {raioX}. Formação: {comoChegar}.
Habilidade escolar ligada: <contexto>[1] {ref} — {texto oficial}</contexto>

Regras da conversa:
- fala: até 400 caracteres, 1ª pessoa, exemplos concretos do dia a dia da profissão.
- Na 2ª ou 3ª resposta, proponha UM miniDesafio curto que use a habilidade [1] numa situação
  da profissão (ex.: média de gols 2, 0, 1, 3 e 0 → "a média conta a história toda?").
- Se houver desafioAberto e a última mensagem do estudante tentar responder:
  avalie em desafioResolvido (true se o raciocínio estiver essencialmente certo, mesmo informal);
  se false, dê uma pista sem entregar a resposta.
- Não proponha outro desafio na mesma conversa depois de resolvido.
- Fuja de temas fora da profissão/escola com gentileza. Nunca peça dados pessoais ou contato.
Histórico: {historico}
Desafio aberto: {desafioAberto | "nenhum"}
```
Schema: `{ fala: string, miniDesafio?: { skillCode, enunciado }, desafioResolvido?: boolean }`. O servidor força `miniDesafio.skillCode = skillCode` e descarta `miniDesafio` se já houver um resolvido.

### `/api/match` (aluno)
```
O algoritmo já escolheu o mentor (NÃO altere): {cargo} · {organizacao} — {bio}
Fatores do score (pontos de 100): afinidade {a}/40, carreira que curtiu {c}/25,
pedido do estudante {p}/10, evolução no semestre {e}/15, engajamento {g}/10.
Carreiras que o estudante quis conhecer: {queroConhecer}. Habilidades que evoluíram: {evoluiram}.
Gere JSON:
- explicacao: 3 frases sobre por que o match faz sentido, valorizando ESFORÇO e EVOLUÇÃO
  (nunca notas).
- perguntasSugeridas: 3 perguntas que o estudante pode fazer ao mentor, ligando o que estudou
  (cite pelo nome as habilidades que evoluíram) à rotina da profissão.
```

### `/api/plano-aula` (professor)
```
<contexto>
[1] (BNCC {ref}) {texto}
[2] (BNCC {ref}) {texto}
[3] (BNCC {ref}) {texto}
[4] (BNCC {ref}) {texto}
[5] (Referencial de IA na Educação — {ref}) {texto}
[6] (Referencial de IA na Educação — {ref}) {texto}
</contexto>
Turma: {serie}º EM, {n} estudantes. Situação na habilidade {code}:
{d}% defasagem, {e}% em desenvolvimento, {m}% dominada.
Interesse principal da turma: "{interesse}". Observações do professor: {notas | "nenhuma"}.

Gere um plano de aula de 50 minutos que desenvolva {code} usando "{interesse}" como contexto.
- Use SOMENTE o <contexto> para afirmações curriculares e cite com [n] (campo citacoes de cada etapa).
- titulo (≤ 80 car.), objetivo (1–2 frases, verbo no infinitivo, alinhado a [1]).
- etapas: 3 a 5, somando 50 minutos (ex.: abertura/problematização, investigação em grupos,
  sistematização, fechamento); cada uma com descrição prática do que professor e estudantes fazem.
- avaliacao: como verificar a aprendizagem de forma formativa.
- adaptacoes: uma por nível (defasagem, em_desenvolvimento, dominada).
- seloEtico: 4 critérios a partir de [5] e [6] — pensamento crítico, autonomia docente,
  transparência no uso de IA, equidade —, com atendido (bool), comoAtende (1 frase) e citacao (n).
- Se a atividade usar IA com estudantes, ela deve estimular análise e questionamento, não respostas prontas.
```
**Pós-processamento:**
1. Remove de `etapas[].citacoes` e `seloEtico[].citacao` números fora de 1–6.
2. Monta `citacoes[]` **a partir dos chunks recuperados** (texto real, nunca o gerado).
3. Ajusta minutos se a soma ≠ 50 (proporcional, arredondado).
4. `id`, `status: "rascunho"`, `criadoEm`, `source`.

## RAG

### Corpus (`data/corpus/`)

**Entrada do time** (`data/corpus/raw/bncc.txt`, `raw/referencial.txt`), formato:
```
### EM13MAT316 | BNCC – Ensino Médio, Matemática, Competência Específica 3, p. 536
<texto literal copiado do documento oficial>

### CE3-MAT | BNCC – Ensino Médio, Matemática, Competência Específica 3, p. 535
<texto literal>
```
`npm run corpus` → `bncc-em.json` / `referencial-ia.json`:
```json
{ "id": "bncc-EM13MAT316", "source": "bncc", "ref": "EM13MAT316",
  "titulo": "Matemática – Competência Específica 3",
  "fonte": "BNCC – Ensino Médio, p. 536", "texto": "…" }
```

**Conteúdo mínimo:**
- BNCC: 16 habilidades do seed + competências específicas a que pertencem (≈ 8) + 4 textos de área curtos ≈ **28 chunks**.
- Referencial de IA na Educação (MEC): **8–12 chunks**, cobrindo: uso ético e responsável · protagonismo e autonomia docente · pensamento crítico e criatividade · equidade e não discriminação · transparência e explicabilidade · privacidade e proteção de dados de crianças e adolescentes · supervisão humana.

> ⚠️ Os textos são **literais** dos documentos oficiais, copiados pelo time (D58). Nunca gerar texto do MEC/BNCC com IA. O script recusa chunks com texto vazio ou menor que 80 caracteres.

### Embeddings (`scripts/embed-corpus.ts`)
```ts
const model = process.env.GEMINI_EMBED_MODEL ?? "text-embedding-004";
for (const c of chunks) {
  const r = await ai.models.embedContent({ model, contents: `${c.ref} ${c.titulo}\n${c.texto}` });
  out.push({ id: c.id, vector: r.embeddings![0].values! });
}
fs.writeFileSync("data/corpus.embeddings.json", JSON.stringify(out));
```
Se o modelo estiver indisponível, usar `gemini-embedding-001` (mesma chamada).

### Retriever (`lib/rag/retriever.ts`)
```ts
retrieve(query: string, o: { k?: number; sources?: ("bncc"|"referencial")[] }): Chunk[]
// 1) códigos BNCC na query (regex /EM13[A-Z]{2,3}\d{3}/) → chunks exatos primeiro
// 2) embed(query) → cosseno contra corpus.embeddings.json filtrado por sources
// 3) falha no embed → score = |tokens(query) ∩ tokens(chunk)| (minúsculas, sem acento, sem stopwords)
// devolve k únicos
```
Para o plano, a query BNCC é `"{code} {descricaoJovem} {interesse}"`; a do Referencial é fixa.

## Fallbacks (`data/fallbacks/*.json`)

| Arquivo | Chaves obrigatórias |
|---|---|
| `diagnostico.json` | `s001`, `s002`, `s003`, `default` |
| `galera.json` | `s001`, `s002`, `s003`, `default` |
| `missao.json` | `EM13MAT316:futebol`, `EM13MAT316:games`, `EM13MAT310:futebol`, `EM13CNT301:futebol`, `EM13MAT316`, `default` |
| `mentor.json` | `analista-dados-esportivos` (roteiro de 3 turnos com o desafio da média), `default` |
| `match.json` | `s001`, `s002`, `s003`, `default` |
| `plano.json` | `2A:EM13MAT316:futebol`, `2A:EM13MAT316:games`, `default` |

`npm run fallbacks` sobe o app localmente com a chave, chama cada rota com as entradas do roteiro e grava as respostas reais. Se não der tempo, os arquivos são escritos à mão no mesmo formato.
