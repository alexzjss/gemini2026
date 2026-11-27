# 06 — IA, RAG e Prompts

## Cliente Gemini (`lib/ai/gemini.ts`)

```ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export async function generateJson<T>(opts: {
  system: string; user: string;
  schema: object;              // responseSchema (OpenAPI subset)
  zod: z.ZodType<T>;
  fallback: () => T;           // lê data/fallbacks/*.json
  temperature?: number;        // default 0.6; plano 0.4; quiz 0.7
}): Promise<{ data: T; source: "ai" | "fallback" }>
```

- `config: { systemInstruction, responseMimeType: "application/json", responseSchema, temperature }`.
- Timeout 15 s (`AbortController`), 1 retry, `zod.safeParse`; qualquer falha → `fallback()`.
- Sem chave configurada → fallback direto (permite rodar a demo offline).

### System prompt base (compartilhado)

```
Você é o assistente pedagógico da plataforma Gemini2026, para estudantes do Ensino Médio
da rede pública brasileira e seus professores. Regras:
- Responda sempre em português do Brasil e SOMENTE no JSON pedido.
- Nunca diga ou sugira que o estudante não pode seguir uma carreira por causa das notas.
  Notas são ponto de partida, não destino.
- Não rotule estudantes. Fale de habilidades, nunca de "aluno fraco".
- Estimule pensamento crítico: dê pistas e perguntas, não respostas prontas, quando o
  público for o estudante.
- Ao tratar de conteúdo curricular, use apenas os trechos fornecidos em <contexto>.
```

## Prompts por rota

### `/api/diagnostico` — tom: aluno
Entrada: lista de habilidades com nível e `descricaoCurta`.
```
Escreva para um estudante do {serie}º ano do EM. Tom jovem, direto, acolhedor, sem gíria forçada.
Habilidades: {json}
Gere: resumo (≤ 3 frases), destaques (2 coisas em que ele manda bem),
proximosPassos (2 habilidades para destravar, com 1 frase de motivação cada).
```

### `/api/vocacional` — tom: aluno
```
Perfil de afinidades (0–100): {profile}
Carreiras escolhidas pelo algoritmo: {careers com nome, descrição, skills}
Status das habilidades do estudante: {skills}
Para cada carreira: porqueCombina (2 frases ligando às afinidades) e
habilidadesParaDestravar (use SOMENTE os códigos já pré-selecionados: {preSelecionados}),
explicando em 1 frase como cada habilidade aparece no dia a dia dessa profissão.
Nunca desencoraje.
```
O servidor pré-seleciona os códigos (regra `07 §2`); o modelo só redige.

### `/api/missao` — tom: aluno
Contexto RAG: chunk da habilidade (`retrieve(skillCode, {k:1})`).
```
<contexto>[1] {ref}: {texto oficial}</contexto>
Crie um quiz de {n=4} questões de múltipla escolha (4 alternativas) sobre a habilidade [1],
nível {serie}º EM, ambientado em "{interesse}" (ex.: futebol → estatísticas de jogadores).
Cada questão: enunciado curto com situação real, uma correta, dica (pista sem entregar)
e explicacao (passo a passo após responder). Números simples, contas feitas à mão.
```
Validação extra no servidor: `alternativas.length === 4`, `0 ≤ correta < 4`, 3–5 questões.

### `/api/match` — tom: aluno
```
Match calculado pelo algoritmo (NÃO altere a escolha): mentor {mentor}, fatores {fatores}.
Explique em 3 frases por que esse match faz sentido, citando afinidades e a EVOLUÇÃO/esforço
do estudante (não notas). Sugira 3 perguntas que o estudante pode fazer ao mentor,
conectando as habilidades da BNCC que ele estudou com a rotina da profissão.
```

### `/api/plano-aula` — tom: professor
```
<contexto>
[1] (BNCC EM13MAT316) ...
[2] (BNCC Competência Específica 3 de Matemática) ...
...
[5] (Referencial IA) ...
</contexto>
Turma: {serie}º EM, {n} alunos. Distribuição na habilidade {code}: {x}% defasagem,
{y}% em desenvolvimento, {z}% dominada. Interesse escolhido: {interesse}.
Observações do professor: {notasProfessor | "nenhuma"}.

Gere um plano de aula de 50 minutos que ensine a habilidade usando o interesse como contexto.
- Use SOMENTE o <contexto> para afirmações curriculares; cite com os números [n] em cada etapa.
- etapas: 3 a 5 (abertura, investigação, sistematização, fechamento...).
- adaptacoes: uma sugestão para cada nível (defasagem, em_desenvolvimento, dominada).
- seloEtico: avalie o plano contra os princípios do Referencial em [5..6]
  (ex.: pensamento crítico, autonomia docente, transparência no uso de IA, equidade);
  para cada critério diga se atende e como.
- Linguagem técnico-pedagógica, objetiva.
```
Pós-processamento: remove `citacoes`/referências a números que não estão no contexto; preenche `citacoes[].trecho` com o texto real do chunk (nunca o texto gerado pelo modelo); `status = "rascunho"`.

## RAG

### Corpus (`data/corpus/*.json`)

```json
{ "id": "bncc-EM13MAT316", "source": "bncc", "ref": "EM13MAT316",
  "titulo": "Matemática e suas Tecnologias – Competência Específica 3",
  "texto": "<texto literal da BNCC>" }
```

Conteúdo mínimo:
- **BNCC:** as ~16 habilidades do seed + as competências específicas de área a que pertencem + texto introdutório da área (curto). ~30 chunks.
- **Referencial de IA na Educação (MEC):** 8–12 chunks com princípios/diretrizes (ex.: uso ético e responsável, protagonismo/autonomia docente, pensamento crítico, equidade e não-discriminação, transparência, privacidade e proteção de dados de crianças e adolescentes).

> ⚠️ O time deve extrair os trechos **literais** dos documentos oficiais. Não inventar texto do MEC. Cada chunk guarda a fonte (página/seção) no campo `titulo`.

### Script de embeddings (`scripts/embed-corpus.ts`)

```ts
for (const chunk of corpus) {
  const r = await ai.models.embedContent({
    model: process.env.GEMINI_EMBED_MODEL ?? "text-embedding-004",
    contents: `${chunk.titulo}\n${chunk.texto}`,
  });
  out.push({ id: chunk.id, vector: r.embeddings[0].values });
}
fs.writeFileSync("data/corpus.embeddings.json", JSON.stringify(out));
```

### Retriever

```ts
retrieve(query, { k = 4, sources }): Chunk[]
// 1. chunks cujo ref aparece literalmente na query → topo
// 2. embedding da query → cosseno contra corpus.embeddings.json (filtrado por sources)
// 3. erro no embedding → score por sobreposição de tokens (lowercase, sem acento, sem stopwords)
```

## Fallbacks (`data/fallbacks/*.json`)

Chaveados para a demo nunca quebrar:

| Arquivo | Chaves |
|---|---|
| `diagnostico.json` | `s001`, `s002`, `s003`, `default` |
| `vocacional.json` | `s001`, `s002`, `s003`, `default` |
| `missao.json` | `EM13MAT316:futebol`, `EM13MAT316:games`, `EM13LP01:default`, `default` |
| `match.json` | `s001`, `s002`, `s003`, `default` |
| `plano.json` | `1A:EM13MAT316:futebol`, `1A:EM13MAT316:games`, `default` |

Gerar os fallbacks rodando as próprias rotas uma vez com a chave e salvando as saídas (script `npm run fallbacks`, opcional) — ou escrevê-los à mão se faltar tempo.
