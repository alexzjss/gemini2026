"use client";
/* Placeholder do Início (dono: Agente 4, F5.5). Já usa o MatchDayCard do F7 (item 5 da tela 3). */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PlaceholderPage from "@/components/ui/PlaceholderPage";
import { InkCard, LevelBar } from "@/components/ui";
import { useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import MatchDayCard from "@/app/aluno/match/_components/MatchDayCard";
import { tokens } from "@/lib/theme";

export default function Inicio() {
  const view = useStudentView(useSessionStudentId());
  if (!view) return null;
  return (
    <PlaceholderPage titulo={`E aí, ${view.student.nome}.`} frente="F5 · Agente 4">
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: { xs: "14px", md: "20px" } }}>
        <InkCard component="section" aria-label="Seu nível">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h3" component="h2" sx={{ color: tokens.paper }}>Nível {view.nivel} · {view.nivelInfo.nome}</Typography>
            <Typography sx={{ fontSize: 13, color: tokens.mutedOnInk }}>{view.progressoNivel.rotulo}</Typography>
          </Box>
          <LevelBar value={view.progressoNivel.fracao} label={`Progresso pro nível ${view.nivel + 1}`} />
          <Typography sx={{ fontSize: 13, color: tokens.mutedOnInk }}>Seus pontos vêm de esforço: missões, frequência e evolução no que você ainda não domina. Nota alta sozinha não conta mais.</Typography>
        </InkCard>
        <MatchDayCard view={view} />
      </Box>
    </PlaceholderPage>
  );
}
