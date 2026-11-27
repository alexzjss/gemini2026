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
import { border, hardShadow, hardShadowSm, motion, tokens } from "@/lib/theme";

export default function Missoes() {
  const view = useStudentView(useSessionStudentId());
  if (!view) return null;
  const lista = [view.missaoDoDia, ...view.sugestoes].filter((m): m is NonNullable<typeof m> => Boolean(m));
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>Missões</Typography>
        <Box sx={{ display: { xs: "none", md: "block" } }}><PointsPill pontos={view.pontos} suffix="pontos" large /></Box>
      </Box>
      <Box sx={{
        display: "grid", gap: { xs: 2.5, md: 3 }, alignItems: "start",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.4fr) minmax(300px, 1fr)" },
        gridTemplateRows: { md: "auto 1fr" },
        gridTemplateAreas: { xs: '"pts" "abertas" "tiers"', md: '"abertas pts" "abertas tiers"' },
      }}>
        <Box sx={{ gridArea: "pts" }}><PointsTable /></Box>
        <Box sx={{ gridArea: "tiers" }}><MentorTiers view={view} /></Box>
        <Box sx={{ gridArea: "abertas", display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box component="section" aria-labelledby="abertas" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
                    <Typography sx={{ fontWeight: 700, fontSize: { md: 17 }, lineHeight: 1.3 }}>{m.titulo}</Typography>
                    <Typography sx={{ fontSize: 13, color: tokens.muted }}>{m.minutos} min</Typography>
                  </Box>
                  {m.feitaHoje ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700, color: tokens.blue }}><CheckRoundedIcon fontSize="small" /> feita hoje</Box>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700, whiteSpace: "nowrap" }}>+30 <ChevronRightRoundedIcon className="seta" aria-hidden sx={{ transition: `transform ${motion.fast}ms ${motion.ease}` }} /></Box>
                  )}
                </>
              );
              const sx = {
                display: "flex", alignItems: "center", gap: 2, p: { xs: 2, md: 2.5 }, borderRadius: { xs: "18px", md: "20px" }, border,
                bgcolor: idx === 0 ? tokens.lime : tokens.surface, color: tokens.ink, textDecoration: "none",
                boxShadow: idx === 0 ? hardShadowSm : "none",
                transition: `transform ${motion.fast}ms ${motion.ease}, box-shadow ${motion.fast}ms ${motion.ease}`,
              } as const;
              const hover = {
                "&:hover": { transform: "translate(-2px,-2px)", boxShadow: hardShadow },
                "&:hover .seta": { transform: "translateX(3px)" },
                "&:active": { transform: "translate(1px,1px)", boxShadow: "none" },
              } as const;
              return m.feitaHoje ? (
                <Box key={m.code} aria-disabled sx={{ ...sx, opacity: 0.7 }}>{conteudo}</Box>
              ) : (
                <Box key={m.code} component={NextLink} href={`/aluno/missoes/${m.code}`} sx={{ ...sx, ...hover }}>{conteudo}</Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
