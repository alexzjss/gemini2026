"use client";
/* Tela 6 — Desafio da semana (3 cenários, fundo ink, +10). */
import { useRouter } from "next/navigation";
import ScenarioFlow from "@/components/aluno/ScenarioFlow";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";

function semanaRef(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dia);
  const ano = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${Math.ceil(((t.getTime() - ano.getTime()) / 86400000 + 1) / 7)}`;
}

export default function DesafioSemana() {
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { dispatch, now } = useActions();
  const router = useRouter();
  if (!view || !studentId) return null;
  const cenarios = view.semana.cenarios;
  const respostas = view.semana.respostas;
  return (
    <ScenarioFlow
      titulo="Desafio da semana"
      bg="ink"
      cenarios={cenarios}
      respostas={respostas}
      inicio={Math.max(0, cenarios.findIndex((c) => !respostas[c.id]))}
      ultimoLabel="Concluir"
      onAnswer={(id, key) => dispatch({ type: "answerSemana", studentId, scenarioId: id, key })}
      onFinish={() => {
        dispatch({ type: "finishSemana", studentId, at: now(), semanaRef: semanaRef() });
        dispatch({ type: "toast", texto: "Seu perfil ficou mais afiado" });
        router.push("/aluno");
      }}
    />
  );
}
