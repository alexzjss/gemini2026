"use client";
/* Tela 10 — Missões. Sugestões seguem docs/07 §8 (missão do dia + 2). */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NextLink from "next/link";
import { BnccChip, PointsPill } from "@/components/ui";
import { MentorTiers, PointsTable } from "@/components/aluno/blocos";
import { useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { border, tokens } from "@/lib/theme";

export default function Missoes() {
  const view = useStudentView(useSessionStudentId());
  if (!view) return null;
  const lista = [view.missaoDoDia, ...view.sugestoes].filter((m): m is NonNullable<typeof m> => Boolean(m));
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>Missões</Typography>
        <PointsPill pontos={view.pontos} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: { xs: 2.5, md: 3 }, alignItems: "start" }}>
        <PointsTable />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box component="section" aria-labelledby="abertas" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Typography id="abertas" variant="h4" component="h2">Abertas pra você</Typography>
            {lista.length === 0 && <Typography sx={{ color: tokens.muted }}>Você já domina as habilidades das suas carreiras. Explore outras no swipe!</Typography>}
            {lista.map((m, idx) => {
              const conteudo = (
                <>
                  <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <BnccChip code={m.code} />
                      {idx === 0 && <Box component="span" sx={{ fontSize: 12, fontWeight: 700, bgcolor: tokens.ink, color: tokens.lime, borderRadius: 999, px: 1, py: 0.25 }}>Missão do dia</Box>}
                    </Box>
                    <Typography sx={{ fontWeight: 700 }}>{m.titulo}</Typography>
                    <Typography sx={{ fontSize: 13, color: tokens.muted }}>{m.minutos} min</Typography>
                  </Box>
                  {m.feitaHoje ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700, color: tokens.blue }}><CheckRoundedIcon fontSize="small" /> feita hoje</Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700 }}>+30 <ChevronRightRoundedIcon aria-hidden /></Box>
                  )}
                </>
              );
              const sx = { display: "flex", alignItems: "center", gap: 1.5, p: 2, borderRadius: "18px", border, bgcolor: idx === 0 ? tokens.lime : tokens.surface, color: tokens.ink, textDecoration: "none" } as const;
              return m.feitaHoje ? (
                <Box key={m.code} aria-disabled sx={{ ...sx, opacity: 0.7 }}>{conteudo}</Box>
              ) : (
                <Box key={m.code} component={NextLink} href={`/aluno/missoes/${m.code}`} sx={sx}>{conteudo}</Box>
              );
            })}
          </Box>
          <MentorTiers view={view} />
        </Box>
      </Box>
    </Box>
  );
}
