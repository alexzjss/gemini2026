"use client";

import { Box, Chip, Paper, Skeleton, Typography, type PaperProps } from "@mui/material";
import Stack from "./Stack";
import type { ReactNode } from "react";
import type { SkillLevel } from "@/lib/types";
import { cores, fonteDisplay } from "./cores";

/**
 * Peças visuais pequenas da UI do professor.
 * Se `components/ui/` (Agente 1) já tiver BnccChip/InkCard equivalentes,
 * troque os usos por eles; a API aqui é propositalmente mínima.
 */

export const ROTULO_NIVEL: Record<SkillLevel, string> = {
  dominada: "Dominada",
  em_desenvolvimento: "Em desenvolvimento",
  defasagem: "Defasagem",
};

/** docs/09: defasagem é lima ("bora destravar"), nunca vermelho. */
export function estiloNivel(level?: SkillLevel) {
  switch (level) {
    case "dominada":
      return { bg: cores.blue, fg: cores.surface, borda: cores.ink };
    case "em_desenvolvimento":
      return { bg: cores.blueSoft, fg: cores.ink, borda: cores.ink };
    case "defasagem":
      return { bg: cores.lime, fg: cores.ink, borda: cores.ink };
    default:
      return { bg: cores.track, fg: cores.muted, borda: cores.track };
  }
}

export function BnccChip({ code, tom = "lime" }: { code: string; tom?: "lime" | "ink" | "blue" }) {
  const bg = tom === "lime" ? cores.lime : tom === "ink" ? cores.ink : cores.blue;
  const fg = tom === "lime" ? cores.ink : cores.surface;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.3,
        px: 1,
        py: 0.5,
        borderRadius: "6px",
        bgcolor: bg,
        color: fg,
        border: `1.5px solid ${cores.ink}`,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {code}
    </Box>
  );
}

export function Overline({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <Typography
      id={id}
      component="p"
      sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: cores.muted, m: 0 }}
    >
      {children}
    </Typography>
  );
}

export function TituloPagina({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h1"
      sx={{ fontFamily: fonteDisplay, fontWeight: 800, fontSize: { xs: 32, md: 40 }, lineHeight: 1, letterSpacing: "-0.02em", m: 0 }}
    >
      {children}
    </Typography>
  );
}

export function TituloSecao({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <Typography id={id} component="h2" sx={{ fontFamily: fonteDisplay, fontWeight: 800, fontSize: { xs: 20, md: 22 }, lineHeight: 1.1, m: 0 }}>
      {children}
    </Typography>
  );
}

/** Card do professor: branco, borda 2px, sem sombra sólida (docs/09 · Professor). */
export function Cartao({ children, sx, ...rest }: PaperProps) {
  return (
    <Paper
      elevation={0}
      {...rest}
      sx={{
        bgcolor: cores.surface,
        border: `2px solid ${cores.ink}`,
        borderRadius: "20px",
        p: { xs: 2, md: 2.5 },
        boxShadow: "none",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

export function PontoStatus({ status }: { status: "atencao" | "acompanhando" | "ok" }) {
  if (status === "ok") return null;
  const cor = status === "atencao" ? cores.danger : cores.blue;
  return (
    <Box component="span" aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: cor, display: "inline-block", flexShrink: 0 }} />
  );
}

export function ChipStatusAtencao({ status }: { status: "atencao" | "acompanhando" | "ok" }) {
  if (status === "ok") return null;
  return (
    <Chip
      size="small"
      variant="outlined"
      icon={<PontoStatus status={status} />}
      label={status === "atencao" ? "Vale uma conversa" : "Acompanhando"}
      sx={{ borderColor: cores.ink, color: cores.ink, fontWeight: 600, pl: 0.75 }}
    />
  );
}

export function LegendaNiveis() {
  const itens: { label: string; level?: SkillLevel }[] = [
    { label: "Dominada", level: "dominada" },
    { label: "Em desenvolvimento", level: "em_desenvolvimento" },
    { label: "Defasagem", level: "defasagem" },
    { label: "Sem dado" },
  ];
  return (
    <Stack direction="row" component="ul" aria-label="Legenda do mapa" sx={{ listStyle: "none", p: 0, m: 0, flexWrap: "wrap", gap: 2 }}>
      {itens.map((i) => {
        const e = estiloNivel(i.level);
        return (
          <Stack key={i.label} component="li" direction="row" alignItems="center" gap={0.75} sx={{ fontSize: 13, color: cores.muted }}>
            <Box aria-hidden sx={{ width: 16, height: 16, borderRadius: "4px", bgcolor: e.bg, border: `1.5px solid ${e.borda}` }} />
            {i.label}
          </Stack>
        );
      })}
    </Stack>
  );
}

export function CarregandoTela() {
  return (
    <Stack gap={2} aria-busy="true" aria-live="polite">
      <Skeleton variant="text" width={280} height={56} />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: "20px" }} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={360} sx={{ borderRadius: "20px" }} />
    </Stack>
  );
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
