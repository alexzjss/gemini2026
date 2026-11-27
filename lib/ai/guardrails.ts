/**
 * Guardrails determinísticos de entrada (pré-LLM) e saída (pós-LLM).
 * Não substituem os filtros de segurança do Gemini; complementam com regras do produto:
 * nunca pedir dados pessoais/contato (CLAUDE.md regra 9), nunca vazar instruções internas,
 * nunca mandar dados pessoais ao Gemini (regra 4).
 */

/* ---------------- entrada ---------------- */

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const TELEFONE = /(\+?55\s?)?\(?\b\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/g;
const CPF = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const ARROBA = /(^|\s)@[\w.]{3,}/g;
const URL = /\bhttps?:\/\/\S+|\bwww\.\S+/gi;

/** Troca e-mail, telefone, CPF, @perfil e links por [removido] antes de enviar texto livre ao Gemini. */
export function limparPII(texto: string): string {
  return texto
    .replace(EMAIL, "[removido]")
    .replace(CPF, "[removido]")
    .replace(TELEFONE, "[removido]")
    .replace(URL, "[removido]")
    .replace(ARROBA, "$1[removido]");
}

/** Remove nomes conhecidos (ex.: alunos do seed) de um texto livre do professor. */
export function removerNomes(texto: string, nomes: string[]): string {
  let out = texto;
  const unicos = [...new Set(nomes.map((n) => n.trim()).filter((n) => n.length >= 3))].sort((a, b) => b.length - a.length);
  for (const nome of unicos) {
    const esc = nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(?<![\\p{L}])${esc}(?![\\p{L}])`, "giu"), "[estudante]");
  }
  return out;
}

/**
 * Neutraliza texto do usuário que vai dentro de um bloco delimitado do prompt:
 * sem quebras de linha (não forja turnos), sem < > (não fecha tags), espaços colapsados.
 */
export function textoSeguro(texto: string, max = 500): string {
  return limparPII(texto)
    .replace(/[<>]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);
}

/* ---------------- saída ---------------- */

/*
 * Bloqueia PEDIDO ou OFERTA de contato/dado pessoal — não a simples menção a uma rede social
 * (o mentor de criador de conteúdo pode falar de Instagram).
 */
const CANAL =
  "(whats\\s?app|whats|zap|telefone|celular|insta(gram)?|tik\\s?tok|facebook|twitter|discord|telegram|e-?mail|endere[cç]o|nome completo|sobrenome|cpf|rg|@)";
const PEDE_CONTATO = new RegExp(
  [
    `\\b(seu|teu|sua|tua|meu|minha)\\s+${CANAL}`,
    `\\b(me|nos)\\s+(passa|manda|envia)\\s+(o\\s+|a\\s+)?(seu|teu|sua|tua)\\b`,
    `\\b(me|nos)\\s+(adiciona|segue|chama)\\b`,
    `\\b(no|pelo|via)\\s+(privado|direct|dm|inbox)\\b`,
    `\\bonde\\s+(voc[eê]|tu)\\s+mora`,
    `\\b(mora|estuda)\\s+em\\s+qual\\b`,
    `(^|\\s)@[\\w.]{3,}`,
  ].join("|"),
  "i",
);

const VAZAMENTO =
  /(regras fixas|systemInstruction|system prompt|prompt de sistema|minhas instru[cç][oõ]es|<\/?contexto>|<\/?historico>|responda somente no json)/i;

export type MotivoBloqueio = "contato" | "vazamento" | null;

/** Verifica um texto gerado para estudante. Devolve o motivo do bloqueio ou null. */
export function verificarSaida(texto: string, o: { contato?: boolean } = {}): MotivoBloqueio {
  if (o.contato !== false && PEDE_CONTATO.test(texto)) return "contato";
  if (VAZAMENTO.test(texto)) return "vazamento";
  return null;
}

/**
 * Verifica todas as strings de um objeto gerado.
 * `contato: false` para textos do professor (um plano pode citar "e-mail" legitimamente).
 */
export function verificarObjeto(obj: unknown, o: { contato?: boolean } = {}): MotivoBloqueio {
  const strings: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") strings.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(obj);
  for (const s of strings) {
    const m = verificarSaida(s, o);
    if (m) return m;
  }
  return null;
}

/* ---------------- corpus ---------------- */

const INSTRUCAO_SUSPEITA =
  /(ignore (as|todas as) (instru|regras)|desconsidere|system prompt|prompt de sistema|voc[eê] (agora )?[eé] um|responda (apenas|somente)|<\/?\w+>)/i;

/** Sinaliza texto do corpus que parece instrução (indirect prompt injection). */
export function pareceInstrucao(texto: string): boolean {
  return INSTRUCAO_SUSPEITA.test(texto);
}
