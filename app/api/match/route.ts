/* PROVISÓRIO — contrato 3 (dono: Agente 3). O score é determinístico (lib/domain/match)
 * e roda aqui no servidor; os textos vêm do fallback. O Agente 3 pluga o Gemini só nos textos. */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse, MatchResult, StudentSnapshot } from "@/lib/types";
import { EIXOS } from "@/lib/config";
import { mentors, getCareer, getSkill } from "@/lib/store/seed";
import { elegivel, escolherMentor } from "@/lib/domain/match";
import { top } from "@/lib/domain/afinidades";
import fallback from "@/data/fallbacks/match.json";

export const runtime = "nodejs";
export const maxDuration = 30;

const Perfil = z.object({ analisar: z.number(), tech: z.number(), criar: z.number(), cuidar: z.number(), negocios: z.number(), esportes: z.number() });
const Ids = z.array(z.string().max(80)).max(30);
const Snapshot = z.object({
  studentId: z.string().max(20),
  serie: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  nivel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  perfil: Perfil,
  top4: Ids, salvas: Ids, queroConhecer: Ids, preferenciasMentor: Ids,
  skills: z.array(z.object({
    code: z.string(), level: z.enum(["defasagem", "em_desenvolvimento", "dominada"]), media: z.number(),
    tendencia: z.enum(["subindo", "estavel", "caindo"]), progresso: z.number(), subiuEm: z.string().optional(),
  })).max(40),
  evolucoes: z.number().min(0), missoes: z.number().min(0), frequenciaMedia: z.number().min(0).max(100), galeraConcluido: z.boolean(),
});

type Texts = { explicacao: string; perguntasSugeridas: string[] };
const FB = fallback as Record<string, Texts>;

function textos(s: StudentSnapshot, mentorCareerIds: string[]): Texts {
  if (FB[s.studentId]) return FB[s.studentId];
  const eixos = top(s.perfil, 2).map((t) => EIXOS[t.eixo].toLowerCase()).join(" e ");
  const quero = mentorCareerIds.find((id) => s.queroConhecer.includes(id) || s.salvas.includes(id));
  const carreiraFrase = quero ? `Você mostrou interesse em ${getCareer(quero)?.nome.toLowerCase()}.` : "A área dela conversa com os caminhos que combinam com você.";
  const evoluida = s.skills.find((k) => k.subiuEm) ?? s.skills.find((k) => k.level !== "dominada");
  const habilidade = evoluida ? getSkill(evoluida.code)?.descricaoJovem.toLowerCase() ?? evoluida.code : "o que eu estudo na escola";
  const vars: Record<string, string> = { eixos, carreiraFrase, missoes: String(s.missoes), evolucoes: String(s.evolucoes), habilidade };
  const f = (t: string) => t.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
  const d = FB.default;
  return { explicacao: f(d.explicacao), perguntasSugeridas: d.perguntasSugeridas.map(f) };
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const parsed = z.object({ snapshot: Snapshot }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Entrada inválida" }, { status: 400 });
  const s = parsed.data.snapshot as StudentSnapshot;

  const el = elegivel(s);
  if (!el.eligible) {
    const res: ApiResponse<MatchResult> = { data: { eligible: false, faltaPara: el.faltaPara, source: "fallback" }, source: "fallback" };
    return NextResponse.json(res);
  }
  const best = escolherMentor(s, mentors);
  if (!best) {
    const res: ApiResponse<MatchResult> = { data: { eligible: false, faltaPara: ["Ainda não há vagas de mentor abertas neste semestre."], source: "fallback" }, source: "fallback" };
    return NextResponse.json(res);
  }
  const t = textos(s, best.mentor.careerIds);
  const data: MatchResult = {
    eligible: true, mentorId: best.mentor.id, score: best.score, fatores: best.fatores,
    explicacao: t.explicacao, perguntasSugeridas: t.perguntasSugeridas.slice(0, 3), source: "fallback",
  };
  return NextResponse.json({ data, source: "fallback" } satisfies ApiResponse<MatchResult>);
}
