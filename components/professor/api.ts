import type { LessonPlan } from "@/lib/types";
import type { PedidoPlano } from "./tipos";

/**
 * Cliente de `POST /api/plano-aula` (contrato em docs/04, rota do Agente 3).
 *
 * O corpo leva só agregados da turma: código BNCC, interesse, distribuição de
 * níveis e nº de alunos. Nada de nome, frequência ou sinal de evasão (LGPD,
 * CLAUDE.md regra 4). A rota nunca devolve 500 na demo: sem chave ou com
 * erro da IA ela responde o fallback com `source: "fallback"`.
 */

export class ErroPlano extends Error {}

function valido(p: unknown): p is LessonPlan {
  if (!p || typeof p !== "object") return false;
  const x = p as Partial<LessonPlan>;
  return typeof x.titulo === "string" && Array.isArray(x.etapas) && Array.isArray(x.citacoes) && Array.isArray(x.seloEtico);
}

export async function gerarPlano(pedido: PedidoPlano, sinal?: AbortSignal): Promise<LessonPlan> {
  let resposta: Response;
  try {
    resposta = await fetch("/api/plano-aula", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId: pedido.classId,
        skillCode: pedido.skillCode,
        interesse: pedido.interesse,
        distribuicao: pedido.distribuicao,
        nAlunos: pedido.nAlunos,
        notasProfessor: limparNotas(pedido.notasProfessor),
      }),
      signal: sinal,
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ErroPlano("Sem conexão com o servidor. Confere a internet e tenta de novo.");
  }
  if (!resposta.ok) throw new ErroPlano("Não deu pra gerar o plano agora. Tenta de novo em instantes.");

  const corpo = (await resposta.json().catch(() => null)) as { data?: unknown; source?: "ai" | "fallback" } | null;
  if (!corpo || !valido(corpo.data)) throw new ErroPlano("A resposta veio incompleta. Tenta gerar de novo.");

  const agora = new Date().toISOString();
  const p = corpo.data;
  return {
    ...p,
    id: p.id || `plano-${Date.now().toString(36)}`,
    classId: p.classId || pedido.classId,
    skillCode: p.skillCode || pedido.skillCode,
    interesse: p.interesse || pedido.interesse,
    duracaoMin: 50,
    status: "rascunho",
    source: corpo.source ?? p.source ?? "fallback",
    criadoEm: p.criadoEm || agora,
    aprovadoEm: undefined,
  };
}

/**
 * O campo livre é a única porta para dado pessoal entrar no pedido: removemos
 * e-mails e sequências numéricas longas (matrícula, telefone, CPF).
 */
export function limparNotas(texto?: string) {
  if (!texto) return undefined;
  const limpo = texto
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[e-mail removido]")
    .replace(/\d[\d.\-/ ]{5,}\d/g, "[número removido]")
    .trim()
    .slice(0, 500);
  return limpo || undefined;
}
