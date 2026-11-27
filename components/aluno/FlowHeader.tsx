"use client";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NextLink from "next/link";
import { tokens } from "@/lib/theme";

type Tone = "onBlue" | "onInk" | "onPaper";

/** Cabeçalho das telas de fluxo: sempre tem saída (voltar ou fechar). */
export default function FlowHeader({
  href = "/aluno", label = "Voltar pro início", icon = "close", titulo, direita, tone = "onPaper",
}: { href?: string; label?: string; icon?: "close" | "back"; titulo?: string; direita?: React.ReactNode; tone?: Tone }) {
  const c = {
    onBlue: { bg: tokens.onBlueSubtle, fg: tokens.white, border: 0 },
    onInk: { bg: tokens.inkRaised, fg: tokens.paper, border: 0 },
    onPaper: { bg: tokens.surface, fg: tokens.ink, border: `2px solid ${tokens.ink}` },
  }[tone];
  return (
    <Box component="header" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, px: 2.5, pt: 2.5, pb: 1 }}>
      <IconButton component={NextLink} href={href} aria-label={label} sx={{ bgcolor: c.bg, color: c.fg, border: c.border, flex: "none", "&:hover": { bgcolor: c.bg } }}>
        {icon === "close" ? <CloseRoundedIcon /> : <ArrowBackRoundedIcon />}
      </IconButton>
      {titulo && <Typography component="p" sx={{ fontWeight: 700, fontSize: 16, color: c.fg, flex: 1, textAlign: "center" }}>{titulo}</Typography>}
      <Box sx={{ minWidth: 44, display: "flex", justifyContent: "flex-end", color: c.fg, fontWeight: 700 }}>{direita}</Box>
    </Box>
  );
}
