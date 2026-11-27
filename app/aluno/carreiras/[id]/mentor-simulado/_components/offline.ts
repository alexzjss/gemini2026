/* Roteiro offline do mentor no CLIENTE (rede caiu antes de chegar à rota).
 * Mesmo formato e mesmas chaves de data/fallbacks/mentor.json (dono: Agente 3) e mesma regra da rota. */
import type { ChatTurn, MentorChatReply, Serie } from "@/lib/types";
import { LIMITES } from "@/lib/config";
import { getCareer } from "@/lib/store/seed";
import fallback from "@/data/fallbacks/mentor.json";

export interface MentorInput {
  careerId: string; skillCode: string; serie: Serie; historico: ChatTurn[];
  desafioAberto?: { skillCode: string; enunciado: string }; desafioJaResolvido?: boolean;
}

type Entry = { fala: string; miniDesafio?: { skillCode?: string; enunciado: string }; desafioResolvido?: boolean };
const FB = fallback as unknown as Record<string, Entry>;

/** Fala de abertura fixa (sem chamada à IA), sempre identificando a simulação. */
export function abertura(careerNome: string): string {
  return `Oi! Sou uma simulação por IA de alguém que trabalha como ${careerNome.toLowerCase()}. Pode perguntar o que quiser: rotina, escola, como começar.`;
}

const RESPOSTA_PLAUSIVEL = /(1[,.]2\b|6\s*(\/|÷|dividido)\s*5|zer[oa]|n[aã]o (fez|marcou)|mediana|varia|esconde|n[aã]o conta)/i;

/** Bloqueio gentil de dados pessoais (telefone, e-mail, @usuário, endereço). */
export function contemDadoPessoal(texto: string): boolean {
  const t = texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return /\b\d{4,5}[-\s]?\d{4}\b/.test(t) || /\S+@\S+\.\S+/.test(t) || /(^|\s)@[a-z0-9_.]{3,}/.test(t) || /\b(rua|avenida|av\.)\s+\w+/.test(t) || /\b(whats|zap|insta|instagram|tiktok)\b.*\d/.test(t);
}

export function falaOffline(i: MentorInput): MentorChatReply {
  const turno = i.historico.filter((t) => t.role === "aluno").length;
  const ultima = i.historico.at(-1)?.texto ?? "";
  const k = turno <= 1 ? "1" : i.desafioJaResolvido ? "fim" : i.desafioAberto ? (RESPOSTA_PLAUSIVEL.test(ultima) ? "3" : "pista") : "2";
  const especifico = `${i.careerId}:1` in FB;
  const chaves = k === "fim" ? [] : especifico ? [`${i.careerId}:${k}`, `default:${k}`] : [`default:${k}`];
  const e = chaves.map((c) => FB[c]).find(Boolean) ?? FB.default;
  const nome = (getCareer(i.careerId)?.nome ?? i.careerId).toLowerCase();
  const f = (s: string) => s.replace(/\{careerNome\}/g, nome).replace(/\{skillCode\}/g, i.skillCode);
  const out: MentorChatReply = { fala: f(e.fala).slice(0, LIMITES.falaMentorMaxChars) };
  if (e.miniDesafio && !i.desafioAberto && !i.desafioJaResolvido) out.miniDesafio = { skillCode: i.skillCode, enunciado: f(e.miniDesafio.enunciado) };
  if (i.desafioAberto && !i.desafioJaResolvido && typeof e.desafioResolvido === "boolean") out.desafioResolvido = e.desafioResolvido;
  return out;
}
