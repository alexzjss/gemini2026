/* Roteiro offline do mentor simulado (fallback de 3 turnos, docs/06 §Fallbacks).
 * Puro: usado pela rota provisória e pelo cliente quando a rede cai. */
import type { ChatTurn, MentorChatReply, Serie } from "@/lib/types";
import { LIMITES } from "@/lib/config";
import { getCareer, getSkill } from "@/lib/store/seed";
import fallback from "@/data/fallbacks/mentor.json";

export interface MentorInput {
  careerId: string; skillCode: string; serie: Serie; historico: ChatTurn[];
  desafioAberto?: { skillCode: string; enunciado: string }; desafioResolvido?: boolean;
}

type Entry = { fala: string; miniDesafio?: { skillCode: string; enunciado: string }; desafioResolvido?: boolean };
const FB = fallback as unknown as Record<string, Entry> & { abertura: Record<string, string> };

export const ABERTURA_PADRAO: Record<string, string> = FB.abertura;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const PISTAS_MEDIA = ["mediana", "moda", "zer", "nao marcou", "varia", "irregular", "desvio", "espalh", "oscil", "nem sempre", "depende", "2 jogos", "dois jogos", "nao conta", "esconde", "constan"];

function avaliar(careerId: string, resposta: string): boolean {
  const t = norm(resposta);
  if (careerId === "analista-dados-esportivos") return PISTAS_MEDIA.some((p) => t.includes(p));
  return t.trim().length >= 25;
}

/** Bloqueio gentil de dados pessoais (telefone, e-mail, @usuário, endereço). */
export function contemDadoPessoal(texto: string): boolean {
  const t = norm(texto);
  return /\b\d{4,5}[-\s]?\d{4}\b/.test(t) || /\S+@\S+\.\S+/.test(t) || /(^|\s)@[a-z0-9_.]{3,}/.test(t) || /\b(rua|avenida|av\.)\s+\w+/.test(t) || /\b(whats|zap|insta|instagram|tiktok)\b.*\d/.test(t);
}

export function falaOffline(input: MentorInput): MentorChatReply {
  const career = getCareer(input.careerId);
  const skill = getSkill(input.skillCode);
  const base = FB[`${input.careerId}:1`] ? input.careerId : "default";
  const vars: Record<string, string> = {
    careerNome: career?.nome.toLowerCase() ?? "profissional",
    raioX: career?.raioX.map((r) => `${r.t} ${r.what.toLowerCase()}`).join("; ") ?? "",
    descricaoJovem: skill?.descricaoJovem.toLowerCase() ?? input.skillCode,
    skillCode: input.skillCode,
    comoChegar: career?.comoChegar ?? "",
  };
  const doAluno = input.historico.filter((h) => h.role === "aluno");
  const ultima = doAluno.at(-1)?.texto ?? "";

  let entry: Entry;
  if (input.desafioAberto && !input.desafioResolvido) entry = FB[`${base}:3:${avaliar(input.careerId, ultima) ? "certo" : "pista"}`];
  else if (doAluno.length <= 1) entry = FB[`${base}:1`];
  else if (!input.desafioResolvido) entry = FB[`${base}:2`];
  else entry = FB[`${base}:4`];

  const f = (s: string) => s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
  const out: MentorChatReply = { fala: f(entry.fala).slice(0, LIMITES.falaMentorMaxChars) };
  if (entry.miniDesafio && !input.desafioResolvido) out.miniDesafio = { skillCode: input.skillCode, enunciado: f(entry.miniDesafio.enunciado) };
  if (typeof entry.desafioResolvido === "boolean") out.desafioResolvido = entry.desafioResolvido;
  return out;
}
