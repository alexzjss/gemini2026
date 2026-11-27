import { generateJson, hasAI } from "@/lib/ai/gemini";
import { buildMatchPrompt } from "@/lib/ai/prompts/match";
import { systemAluno } from "@/lib/ai/prompts/system";
import { cortar, minuscula, rotaIA, termo } from "@/lib/ai/rota";
import { matchInput, matchOutput, matchSchema, type MatchOutput } from "@/lib/ai/schemas";
import { careerById, descricaoSkill, mentors } from "@/lib/ai/seed";
import { elegivel, escolherMentor } from "@/lib/domain/match";
import { verificarObjeto } from "@/lib/ai/guardrails";
import { getFallback, preencher } from "@/lib/fallbacks";
import type { MatchResult, Mentor, StudentSnapshot } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * O mentor é escolhido por lib/domain/match.ts (fonte de verdade, determinístico).
 * O Gemini só redige `explicacao` e `perguntasSugeridas`.
 */

function textosFallback(snapshot: StudentSnapshot, mentor: Mentor): MatchOutput {
  const carreira = mentor.careerIds.map(careerById).find(Boolean);
  const evoluiu = snapshot.skills.find((s) => s.subiuEm) ?? snapshot.skills.find((s) => s.tendencia === "subindo");
  // O texto por aluno foi escrito para o mentor do roteiro; com outro mentor, usa o genérico.
  const porAluno = getFallback<MatchOutput & { mentorId?: string }>("match", [snapshot.studentId]);
  const { mentorId, ...texto } = porAluno.data;
  const base = mentorId && mentorId !== mentor.id ? getFallback<MatchOutput>("match", []).data : texto;
  return preencher(base, {
    cargo: minuscula(mentor.cargo),
    organizacao: mentor.organizacao,
    carreira: minuscula(carreira?.nome ?? mentor.cargo),
    habilidade: evoluiu ? termo(descricaoSkill(evoluiu.code)) : "o que você estudou nas missões",
  });
}

const limpar = (d: MatchOutput): MatchOutput => ({
  explicacao: cortar(d.explicacao, 480),
  perguntasSugeridas: d.perguntasSugeridas.slice(0, 3).map((p) => cortar(p, 200)),
});

function semTexto(snapshot: StudentSnapshot): { data: MatchResult; source: "ai" | "fallback" } | { mentor: Mentor; score: number; fatores: MatchResult["fatores"] } {
  const source = hasAI() ? "ai" : "fallback";
  const e = elegivel(snapshot);
  if (!e.eligible) return { data: { eligible: false, faltaPara: e.faltaPara, source }, source };
  const escolha = escolherMentor(snapshot, mentors);
  if (!escolha) {
    const faltaPara = ["Os mentores do seu nível já estão com a agenda cheia — novas vagas abrem no próximo Match Day."];
    return { data: { eligible: false, faltaPara, source }, source };
  }
  return escolha;
}

export const POST = rotaIA({
  nome: "match",
  input: matchInput,
  run: async ({ snapshot }, ctx) => {
    const s = snapshot as StudentSnapshot;
    const base = semTexto(s);
    if ("data" in base) return base;
    const { mentor, score, fatores } = base;
    const r = await generateJson({
      rota: "match",
      deadline: ctx.deadline,
      validar: (d) => verificarObjeto(d),
      system: systemAluno,
      user: buildMatchPrompt({
        mentor,
        fatores: fatores!,
        queroConhecer: s.queroConhecer.map((id) => careerById(id)?.nome ?? id),
        evoluiram: s.skills.filter((x) => x.subiuEm).map((x) => descricaoSkill(x.code)),
      }),
      responseSchema: matchSchema,
      zod: matchOutput,
      temperature: 0.6,
      fallback: () => textosFallback(s, mentor),
      postprocess: limpar,
    });
    const data: MatchResult = {
      eligible: true,
      mentorId: mentor.id,
      score,
      fatores,
      explicacao: r.data.explicacao,
      perguntasSugeridas: r.data.perguntasSugeridas,
      source: r.source,
    };
    return { data, source: r.source };
  },
  emErro: ({ snapshot }) => {
    const s = snapshot as StudentSnapshot;
    const base = semTexto(s);
    if ("data" in base) return { data: { ...base.data, source: "fallback" }, source: "fallback" };
    const t = limpar(textosFallback(s, base.mentor));
    return {
      data: { eligible: true, mentorId: base.mentor.id, score: base.score, fatores: base.fatores, ...t, source: "fallback" },
      source: "fallback",
    };
  },
});
