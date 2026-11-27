"use client";
/* Tela 4 — Da Galera. Retoma no 1º cenário não respondido; salva cada resposta na hora. */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import ScenarioFlow from "@/components/aluno/ScenarioFlow";
import { AffinityBar } from "@/components/ui";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { scenariosGalera } from "@/lib/store/seed";
import { EIXO_LABEL } from "@/lib/config";
import { tokens } from "@/lib/theme";

export default function DaGalera() {
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { dispatch, now } = useActions();
  const router = useRouter();
  if (!view || !studentId) return null;
  const cenarios = scenariosGalera();
  const respostas = view.galera.respostas;
  const inicio = view.galera.concluido ? 0 : Math.max(0, cenarios.findIndex((c) => !respostas[c.id]));

  return (
    <ScenarioFlow
      titulo="Da Galera"
      cenarios={cenarios}
      respostas={respostas}
      inicio={inicio}
      ultimoLabel="Ver meu resultado"
      onAnswer={(id, key) => dispatch({ type: "answerGalera", studentId, scenarioId: id, key })}
      onFinish={() => { dispatch({ type: "finishGalera", studentId, at: now() }); router.push("/aluno/galera/resultado"); }}
      aside={() => (
        <Box sx={{ color: tokens.white, display: "flex", flexDirection: "column", gap: 2, bgcolor: tokens.onBlueSubtle, borderRadius: "24px", p: 3 }}>
          <Typography variant="h4" component="h2" sx={{ color: tokens.white }}>Até agora, você curte</Typography>
          {view.galera.parcialTop3.length ? (
            <Box sx={{ bgcolor: tokens.surface, color: tokens.ink, borderRadius: "16px", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {view.galera.parcialTop3.map((t) => <AffinityBar key={t.eixo} label={EIXO_LABEL[t.eixo]} value={t.valor} />)}
            </Box>
          ) : (
            <Typography sx={{ color: tokens.blueTint }}>Responde mais uns cenários que a gente começa a desenhar seu perfil.</Typography>
          )}
          <Typography sx={{ fontSize: 14, color: tokens.blueTint }}>Isso se mistura com a sua ficha BNCC pra sugerir carreiras. Quem decide o caminho é você.</Typography>
        </Box>
      )}
    />
  );
}
