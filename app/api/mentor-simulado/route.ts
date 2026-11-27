import { generateJson } from "@/lib/ai/gemini";
import { verificarObjeto } from "@/lib/ai/guardrails";
import { buildMentorPrompt, buildMentorSystem } from "@/lib/ai/prompts/mentor";
import { SYSTEM_BASE } from "@/lib/ai/prompts/system";
import { cortar, minuscula, rotaIA } from "@/lib/ai/rota";
import { mentorInput, mentorOutput, mentorSchema, type MentorInput, type MentorOutput } from "@/lib/ai/schemas";
import { careerById } from "@/lib/ai/seed";
import { getFallback, preencher, temFallback } from "@/lib/fallbacks";
import { grafoPadrao } from "@/lib/grafo";
import { montarContextoTutor } from "@/lib/rag/graphrag";
import { retrieve } from "@/lib/rag/retriever";
import type { MentorChatReply } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const nomeCarreira = (i: MentorInput) => careerById(i.careerId)?.nome ?? i.careerId.replace(/-/g, " ");

/**
 * Offline não há quem avalie o raciocínio: cada roteiro traz em `{careerId}:aceita` o padrão de uma
 * resposta plausível (a conta ou a ideia central do desafio); o genérico fica em `default:aceita`.
 * Resposta que não bate recebe a pista.
 */
function respostaPlausivel(careerId: string, texto: string): boolean {
  const { padrao } = getFallback<{ padrao: string }>("mentor", [`${careerId}:aceita`, "default:aceita"]).data;
  try {
    return new RegExp(padrao, "i").test(texto);
  } catch {
    return false;
  }
}

/**
 * Roteiro offline (data/fallbacks/mentor.json):
 *  turno 1 → ":1" (rotina) · desafio ainda não aberto → ":2" (abre o desafio)
 *  desafio aberto → ":3" (resolvido) ou ":pista" · depois disso → "default" (encerramento)
 */
function chaveRoteiro(i: MentorInput): string {
  const turno = i.historico.filter((t) => t.role === "aluno").length;
  if (turno <= 1) return "1";
  if (i.desafioJaResolvido) return "fim";
  if (i.desafioAberto) {
    const ultima = i.historico[i.historico.length - 1]?.texto ?? "";
    const especifico = temFallback("mentor", `${i.careerId}:1`);
    return respostaPlausivel(especifico ? i.careerId : "default", ultima) ? "3" : "pista";
  }
  return "2";
}

function fallback(i: MentorInput): MentorOutput {
  const k = chaveRoteiro(i);
  const chaves = k === "fim" ? [] : [`${i.careerId}:${k}`, `default:${k}`];
  // Roteiro específico só vale se a carreira tiver as 3 etapas; senão, usa o genérico inteiro.
  const especifico = temFallback("mentor", `${i.careerId}:1`);
  return preencher(getFallback<MentorOutput>("mentor", especifico ? chaves : chaves.slice(1)).data, {
    careerNome: minuscula(nomeCarreira(i)),
    skillCode: i.skillCode,
  });
}

/** Regras do servidor: 1 desafio por sessão, skillCode forçado, avaliação só com desafio aberto. */
function sanear(i: MentorInput, r: MentorOutput): MentorChatReply {
  const out: MentorChatReply = { fala: cortar(r.fala, 400) };
  const podeAbrir = !i.desafioAberto && !i.desafioJaResolvido;
  if (r.miniDesafio && podeAbrir) {
    out.miniDesafio = { skillCode: i.skillCode, enunciado: cortar(r.miniDesafio.enunciado, 400) };
  } else if (r.miniDesafio && out.fala.endsWith(":")) {
    // A fala anunciava um desafio que o servidor descartou: troca por um encerramento neutro.
    out.fala = getFallback<MentorOutput>("mentor", []).data.fala;
  }
  if (i.desafioAberto && !i.desafioJaResolvido && typeof r.desafioResolvido === "boolean") {
    out.desafioResolvido = r.desafioResolvido;
  }
  return out;
}

export const POST = rotaIA({
  nome: "mentor-simulado",
  input: mentorInput,
  run: async (i, ctx) => {
    let chunks = await retrieve(i.skillCode, { k: 1, exato: true, rotulo: "mentor" });
    let blocoGrafo: string | undefined;
    if (i.estadoGrafo) {
      // GraphRAG: competências da pergunta + pré-requisitos pendentes + texto literal da BNCC.
      const pergunta = i.historico[i.historico.length - 1].texto;
      const tutor = await montarContextoTutor(grafoPadrao, { alunoId: "anon", ...i.estadoGrafo }, pergunta, { base: chunks });
      chunks = tutor.chunks;
      blocoGrafo = tutor.blocoGrafo;
    }
    const career = careerById(i.careerId);
    const r = await generateJson({
      rota: "mentor-simulado",
      deadline: ctx.deadline,
      system: `${SYSTEM_BASE}\n\n${buildMentorSystem(i, career, minuscula(nomeCarreira(i)), chunks, blocoGrafo)}`,
      user: buildMentorPrompt(i),
      responseSchema: mentorSchema,
      zod: mentorOutput,
      temperature: 0.8,
      // Guardrail de saída: pedido/oferta de contato ou vazamento de instruções → nova tentativa/fallback.
      validar: (m) => verificarObjeto(m),
      fallback: () => fallback(i),
    });
    return { data: sanear(i, r.data), source: r.source };
  },
  emErro: (i) => ({ data: sanear(i, fallback(i)), source: "fallback" }),
});
