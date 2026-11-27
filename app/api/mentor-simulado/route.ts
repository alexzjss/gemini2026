/* PROVISÓRIO — contrato 3 (dono: Agente 3). Responde só com o fallback (roteiro de 3 turnos).
 * O Agente 3 troca o corpo por generateJson + RAG sem mudar entrada/saída. */
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse, MentorChatReply } from "@/lib/types";
import { LIMITES } from "@/lib/config";
import { falaOffline } from "@/app/aluno/carreiras/[id]/mentor-simulado/_components/offline";

export const runtime = "nodejs";
export const maxDuration = 30;

const Input = z.object({
  careerId: z.string().min(1).max(80),
  skillCode: z.string().min(1).max(20),
  serie: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  historico: z.array(z.object({ role: z.enum(["aluno", "mentor"]), texto: z.string().max(LIMITES.textoMaxChars), at: z.string() })).max(LIMITES.chatMaxTurnos * 2),
  desafioAberto: z.object({ skillCode: z.string(), enunciado: z.string().max(LIMITES.textoMaxChars) }).optional(),
  desafioResolvido: z.boolean().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const parsed = Input.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Entrada inválida" }, { status: 400 });
  const res: ApiResponse<MentorChatReply> = { data: falaOffline(parsed.data), source: "fallback" };
  return NextResponse.json(res);
}
