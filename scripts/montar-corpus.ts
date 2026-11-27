/**
 * npm run corpus — data/corpus/raw/{bncc,referencial}.txt → data/corpus/{bncc-em,referencial-ia}.json
 *
 * Formato de entrada (linhas com // são ignoradas):
 *   ### EM13MAT316 | BNCC – Ensino Médio, Matemática, Competência Específica 3, p. 536
 *   <texto literal copiado do documento oficial>
 *
 * Os textos são LITERAIS (D58): o script só estrutura, nunca gera nem reescreve.
 * Cada bloco ### vira 1 chunk (unidade semântica completa: habilidade, competência, texto de área
 * ou trecho do Referencial) — sem corte por caractere nem sobreposição.
 * Erros (bloqueiam): texto < 80 caracteres, ref duplicada.
 * Avisos: texto > 2.000 caracteres (dilui a relevância), texto com cara de instrução
 * (possível prompt injection), habilidades do seed sem chunk.
 */
import fs from "node:fs";
import path from "node:path";
import { pareceInstrucao } from "../lib/ai/guardrails";
import { hashChunk, hashLista } from "../lib/rag/hash";

type Source = "bncc" | "referencial";
type Area = "MAT" | "LGG" | "CNT" | "CHS";
type Tipo = "habilidade" | "competencia" | "area" | "referencial";
interface Chunk {
  id: string;
  source: Source;
  ref: string;
  titulo: string;
  fonte: string;
  texto: string;
  area: Area | null;
  tipo: Tipo;
  hash: string;
}

const ROOT = process.cwd();
const RAW = path.join(ROOT, "data/corpus/raw");
const ENTRADAS: { arquivo: string; saida: string; source: Source; prefixo: string }[] = [
  { arquivo: "bncc.txt", saida: "data/corpus/bncc-em.json", source: "bncc", prefixo: "bncc" },
  { arquivo: "referencial.txt", saida: "data/corpus/referencial-ia.json", source: "referencial", prefixo: "ref" },
];
const MIN_CHARS = 80;
const MAX_CHARS = 2_000;

/** Metadados derivados da ref (para filtro e rastreabilidade). */
function metadados(ref: string, source: Source): { area: Area | null; tipo: Tipo } {
  if (source === "referencial") return { area: null, tipo: "referencial" };
  const hab = /^EM13(MAT|LGG|CNT|CHS)\d{3}$/.exec(ref);
  if (hab) return { area: hab[1] as Area, tipo: "habilidade" };
  if (/^EM13LP\d{2}$/.test(ref)) return { area: "LGG", tipo: "habilidade" };
  const ce = /^CE\d-(MAT|LGG|CNT|CHS)$/.exec(ref);
  if (ce) return { area: ce[1] as Area, tipo: "competencia" };
  const area = /^AREA-(MAT|LGG|CNT|CHS)$/.exec(ref);
  if (area) return { area: area[1] as Area, tipo: "area" };
  return { area: null, tipo: "area" };
}
const LOCALIZADOR = /^(p\.|pp\.|pág|pag|seç|sec|cap|item)/i;

function parseCabecalho(linha: string, nLinha: number, arquivo: string) {
  const [refBruta, resto = ""] = linha.replace(/^###\s*/, "").split("|").map((s) => s.trim());
  if (!refBruta) throw new Error(`${arquivo}:${nLinha} cabeçalho sem ref`);
  const partes = resto.split(",").map((s) => s.trim()).filter(Boolean);
  const documento = partes[0] ?? "";
  const local = partes.length > 1 && LOCALIZADOR.test(partes[partes.length - 1]) ? partes.pop()! : "";
  const meio = partes.slice(1);
  return {
    ref: refBruta,
    titulo: meio.length ? meio.join(" – ") : refBruta,
    fonte: [documento, local].filter(Boolean).join(", ") || documento,
  };
}

function montar(e: (typeof ENTRADAS)[number]): Chunk[] {
  const file = path.join(RAW, e.arquivo);
  if (!fs.existsSync(file)) {
    console.warn(`⚠️  ${e.arquivo} não encontrado — gerando lista vazia`);
    return [];
  }
  const linhas = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n");
  const chunks: Chunk[] = [];
  const erros: string[] = [];
  const avisos: string[] = [];
  let atual: { cab: ReturnType<typeof parseCabecalho>; linha: number; texto: string[] } | null = null;

  const fechar = () => {
    if (!atual) return;
    const texto = atual.texto.join("\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    const { ref, titulo, fonte } = atual.cab;
    if (texto.length < MIN_CHARS) erros.push(`${e.arquivo}:${atual.linha} ${ref}: texto com ${texto.length} caracteres (mínimo ${MIN_CHARS})`);
    else if (chunks.some((c) => c.ref === ref)) erros.push(`${e.arquivo}:${atual.linha} ${ref}: ref duplicada`);
    else {
      if (texto.length > MAX_CHARS) avisos.push(`${ref}: ${texto.length} caracteres (> ${MAX_CHARS}); confira se é um único trecho`);
      if (pareceInstrucao(texto)) avisos.push(`${ref}: texto com cara de instrução; confira se é literal do documento`);
      const base = { ref, titulo, texto };
      chunks.push({ id: `${e.prefixo}-${ref}`, source: e.source, ref, titulo, fonte, texto, ...metadados(ref, e.source), hash: hashChunk(base) });
    }
    atual = null;
  };

  linhas.forEach((l, i) => {
    if (l.trimStart().startsWith("//")) return;
    if (l.startsWith("###")) {
      fechar();
      try {
        atual = { cab: parseCabecalho(l, i + 1, e.arquivo), linha: i + 1, texto: [] };
      } catch (err) {
        erros.push((err as Error).message);
      }
      return;
    }
    if (atual) atual.texto.push(l);
    else if (l.trim()) erros.push(`${e.arquivo}:${i + 1} texto fora de um bloco ### (ignorado)`);
  });
  fechar();

  if (avisos.length) console.warn(`⚠️  ${e.arquivo}:\n  - ${avisos.join("\n  - ")}`);
  if (erros.length) {
    console.error(`❌ ${e.arquivo}:\n  - ${erros.join("\n  - ")}`);
    process.exitCode = 1;
  }
  return chunks;
}

function avisarFaltantes(bncc: Chunk[]) {
  const seedSkills = path.join(ROOT, "data/seed/skills.json");
  if (!fs.existsSync(seedSkills)) return;
  const codes: string[] = (JSON.parse(fs.readFileSync(seedSkills, "utf8")) as { code: string }[]).map((s) => s.code);
  const refs = new Set(bncc.map((c) => c.ref));
  const faltam = codes.filter((c) => !refs.has(c));
  if (faltam.length) console.warn(`⚠️  habilidades do seed sem chunk na BNCC (${faltam.length}): ${faltam.join(", ")}`);
}

const resultado = ENTRADAS.map((e) => {
  const chunks = montar(e);
  fs.writeFileSync(path.join(ROOT, e.saida), `${JSON.stringify(chunks, null, 2)}\n`);
  console.log(`✓ ${e.saida}: ${chunks.length} chunks`);
  return chunks;
});
avisarFaltantes(resultado[0]);
console.log(`corpusHash ${hashLista(resultado.flat().map((c) => c.hash))}`);
if (process.exitCode) console.error("Corrija os erros acima (os chunks válidos foram gravados).");
else console.log("Próximo passo: npm run embed");
