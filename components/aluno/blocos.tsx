"use client";
/* Blocos compartilhados das telas do aluno (docs/10). */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import { InkCard, LevelBar, formatPontos } from "@/components/ui";
import type { StudentView } from "@/lib/store/hooks";
import { NIVEIS } from "@/lib/config";
import { border, diaACor, fonts, tokens } from "@/lib/theme";
import type { Career } from "@/lib/types";

export const primeiroNome = (v: StudentView) => v.student.nome.split(" ")[0];

export function LevelCard({ view, compact = false }: { view: StudentView; compact?: boolean }) {
  return (
    <InkCard component="section" aria-label="Seu nível">
      {!compact && <Typography variant="overline" sx={{ color: tokens.mutedOnInk }}>Seu nível</Typography>}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h3" component="h2" sx={{ color: tokens.paper }}>Nível {view.nivel} · {view.nivelInfo.nome}</Typography>
        <Typography sx={{ fontSize: 13, color: tokens.mutedOnInk }}>{view.progressoNivel.rotulo}</Typography>
      </Box>
      <LevelBar value={view.progressoNivel.fracao} label={`Progresso no nível ${view.nivel}`} />
      <Typography sx={{ fontSize: 13, lineHeight: 1.4, color: tokens.mutedOnInk }}>
        Seus pontos vêm de esforço: missões, frequência e evolução no que você ainda não domina. Nota alta sozinha não conta mais.
      </Typography>
    </InkCard>
  );
}

export function PointsTable() {
  const itens = [
    ["+40", "evoluir no que você ainda não domina"],
    ["+30", "completar uma missão BNCC"],
    ["+15", "semana com presença em dia"],
    ["+10", "explorar carreiras e o Da Galera"],
  ];
  return (
    <InkCard component="section" aria-labelledby="pts-titulo">
      <Typography id="pts-titulo" variant="h4" component="h2" sx={{ color: tokens.paper }}>Pontos vêm de esforço, não só de nota</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
        {itens.map(([p, t]) => (
          <Box key={p} sx={{ bgcolor: tokens.inkRaised, border: `2px solid ${tokens.inkBorder}`, borderRadius: "14px", p: 1.5 }}>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 22, color: tokens.lime }}>{p}</Typography>
            <Typography sx={{ fontSize: 13, color: tokens.mutedOnInk, lineHeight: 1.35 }}>{t}</Typography>
          </Box>
        ))}
      </Box>
    </InkCard>
  );
}

export function MentorTiers({ view }: { view: StudentView }) {
  const tiers = [
    { n: 1, t: "Profissionais da sua região" },
    { n: 2, t: "Universitários e técnicos" },
    { n: 4, t: "Alta demanda: Big Tech, medicina, executivos" },
  ];
  return (
    <Box component="section" aria-labelledby="tiers-titulo" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Typography id="tiers-titulo" variant="h4" component="h2">Mentores que você destrava</Typography>
      {tiers.map(({ n, t }) => {
        const aberto = view.nivel >= n;
        const falta = Math.max(0, (NIVEIS.find((x) => x.id === n)?.min ?? 0) - view.pontos);
        return (
          <Box key={n} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "16px", border: aberto ? border : `2px dashed ${tokens.ink}`, bgcolor: aberto ? tokens.surface : tokens.paper }}>
            <Box aria-hidden sx={{ width: 40, height: 40, flex: "none", borderRadius: "12px", border, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: aberto ? tokens.lime : tokens.track }}>
              {aberto ? <LockOpenRoundedIcon fontSize="small" /> : <LockRoundedIcon fontSize="small" />}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{t}</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.muted }}>
                {aberto ? `aberto desde o nível ${n}` : `nível ${n} · faltam ${formatPontos(falta)} pts`}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

/** Topo colorido de carreira (`diaACor`). */
export function CareerTop({ career, combina, children }: { career: Career; combina: string[]; children?: React.ReactNode }) {
  const c = diaACor[career.diaACor];
  return (
    <Box sx={{ bgcolor: c.bg, color: c.fg, p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 1 }}>
      {children}
      {combina.length > 0 && <Typography sx={{ fontSize: 13, fontWeight: 700, color: c.sub }}>combina: {combina.join(" + ")}</Typography>}
      <Typography variant="h2" component="h2" sx={{ color: c.fg }}>{career.nome}</Typography>
    </Box>
  );
}
