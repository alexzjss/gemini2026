// docs/07 §7 — sinais de atenção. SOMENTE para a UI do professor; nunca vai ao Gemini; não afeta pontos nem match.
import type { SkillStatus, Student, StudentLocal } from "../types";
import { LIMIARES } from "../config";
import { diasEntre, media } from "./util";

export type SinalTipo = "frequencia_baixa" | "queda_frequencia" | "inatividade" | "notas_em_queda";
export interface Sinal { tipo: SinalTipo; texto: string }
export type StatusAtencao = "ok" | "atencao" | "acompanhando";

/** Alerta registrado pelo professor. `tipos` = sinais vistos na hora do "Conversei"
 *  (se ausente, considera que todos os sinais atuais já eram conhecidos). */
export interface AlertaRegistro { conversouEm: string; nota: string; tipos?: SinalTipo[] }

export function sinais(
  student: Student,
  skills: SkillStatus[],
  local?: Pick<StudentLocal, "ultimoAcesso">,
  agoraIso?: string,
): Sinal[] {
  const L = LIMIARES.evasao;
  const out: Sinal[] = [];
  const f = student.frequencia;

  const ult4 = media(f.slice(-4));
  if (f.length >= 4 && ult4 < L.frequenciaBaixa)
    out.push({ tipo: "frequencia_baixa", texto: `Frequência de ${Math.round(ult4)}% nas últimas 4 semanas` });

  if (f.length >= 8) {
    const ult2 = media(f.slice(-2));
    const ant6 = media(f.slice(-8, -2));
    if (ult2 <= ant6 - L.quedaPontos)
      out.push({
        tipo: "queda_frequencia",
        texto: `Frequência caiu ${Math.round(ant6 - ult2)} pontos nas últimas 2 semanas`,
      });
  }

  const dias =
    local?.ultimoAcesso && agoraIso ? Math.max(0, diasEntre(local.ultimoAcesso, agoraIso)) : local?.ultimoAcesso ? 0 : student.ultimoAcessoDiasAtras;
  if (dias >= L.inatividadeDias) out.push({ tipo: "inatividade", texto: `Sem entrar na plataforma há ${dias} dias` });

  const caindo = skills.filter((s) => s.tendencia === "caindo").length;
  if (caindo >= L.habilidadesCaindo)
    out.push({ tipo: "notas_em_queda", texto: `Queda em ${caindo} habilidades do 1º para o 2º bimestre` });

  return out;
}

export function status(atuais: Sinal[], alerta?: AlertaRegistro): StatusAtencao {
  if (atuais.length === 0) return "ok";
  if (!alerta) return "atencao";
  const conhecidos = alerta.tipos;
  const novo = conhecidos ? atuais.some((s) => !conhecidos.includes(s.tipo)) : false;
  return novo ? "atencao" : "acompanhando";
}
