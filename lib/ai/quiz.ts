import type { QuizOutput } from "@/lib/ai/schemas";
import type { Quiz } from "@/lib/types";

type Correta = Quiz["questoes"][number]["correta"];

/** PRNG determinístico (mulberry32) a partir de uma string. */
export function prng(semente: string) {
  let h = 2166136261;
  for (let n = 0; n < semente.length; n++) h = Math.imul(h ^ semente.charCodeAt(n), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Embaralha as alternativas de um quiz gerado pela IA (modelos tendem a repetir a posição
 * da correta). Determinístico por skill+interesse+questão: o mesmo quiz sai sempre igual.
 */
export function embaralhar(q: QuizOutput["questoes"][number], semente: string) {
  const rnd = prng(semente);
  const ordem = [0, 1, 2, 3];
  for (let n = 3; n > 0; n--) {
    const j = Math.floor(rnd() * (n + 1));
    [ordem[n], ordem[j]] = [ordem[j], ordem[n]];
  }
  return {
    alternativas: ordem.map((o) => q.alternativas[o]),
    correta: ordem.indexOf(q.correta) as Correta,
  };
}

