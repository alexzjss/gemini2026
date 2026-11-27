import type { PlanoInput } from "@/lib/ai/schemas";
import type { Chunk } from "@/lib/rag/retriever";
import { textoSeguro } from "@/lib/ai/guardrails";
import { blocoContexto } from "./system";

export function rotuloCitacao(c: Chunk): string {
  return c.source === "bncc" ? `(BNCC ${c.ref})` : `(Referencial de IA na Educação — ${c.ref})`;
}

export function buildPlanoPrompt(o: {
  input: PlanoInput;
  serie: number;
  chunks: Chunk[];
  pct: { defasagem: number; em_desenvolvimento: number; dominada: number };
  /** Observações do professor já sem nomes de estudantes. */
  observacoes?: string;
}): string {
  const { input: i, chunks, pct } = o;
  const temHabilidade = chunks[0]?.ref === i.skillCode;
  const refs = chunks.map((c, n) => ({ c, n: n + 1 })).filter((x) => x.c.source === "referencial").map((x) => `[${x.n}]`);
  const alinhado = temHabilidade
    ? "alinhado a [1]"
    : `alinhado a ${i.skillCode}; o texto oficial dessa habilidade NÃO está no contexto, então não o cite nem o parafraseie`;
  const selo = refs.length
    ? `a partir de ${refs.join(" e ")}`
    : "(sem trecho do Referencial disponível: deixe citacao vazia)";
  return `${blocoContexto(chunks, rotuloCitacao)}
Turma: ${o.serie}º EM, ${i.nAlunos} estudantes. Situação na habilidade ${i.skillCode}:
${pct.defasagem}% defasagem, ${pct.em_desenvolvimento}% em desenvolvimento, ${pct.dominada}% dominada.
Interesse principal da turma: "${i.interesse}".
<observacoes>${o.observacoes ? textoSeguro(o.observacoes, 500) : "nenhuma"}</observacoes>

Gere um plano de aula de 50 minutos que desenvolva ${i.skillCode} usando "${i.interesse}" como contexto.
- Use SOMENTE o <contexto> para afirmações curriculares e cite com [n] (campo citacoes de cada etapa, só os números).
- titulo (≤ 80 car.), objetivo (1–2 frases, verbo no infinitivo, ${alinhado}).
- etapas: 3 a 5, somando 50 minutos (ex.: abertura/problematização, investigação em grupos,
  sistematização, fechamento); cada uma com descrição prática do que professor e estudantes fazem.
- avaliacao: como verificar a aprendizagem de forma formativa.
- adaptacoes: uma por nível (defasagem, em_desenvolvimento, dominada).
- seloEtico: 4 critérios ${selo} — pensamento crítico, autonomia docente,
  transparência no uso de IA, equidade —, com atendido (bool), comoAtende (1 frase) e citacao (n).
  atendido = true só se uma etapa do plano realmente fizer isso; comoAtende aponta qual etapa.
- Se a atividade usar IA com estudantes, ela deve estimular análise e questionamento, não respostas prontas.`;
}
