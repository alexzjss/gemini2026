"use client";
import Box from "@mui/material/Box";
import { motion, useReducedMotion } from "framer-motion";
import SparkIcon from "./SparkIcon";
import { tokens } from "@/lib/theme";

const fmt = new Intl.NumberFormat("pt-BR");
export const formatPontos = (n: number) => fmt.format(n);

/** Pill `ink` + texto `lime` com a estrela; faz "pop" quando o valor muda. */
export default function PointsPill({ pontos, suffix, large = false }: { pontos: number; suffix?: string; large?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <Box
      component={motion.span}
      key={pontos}
      initial={reduce ? false : { scale: 1 }}
      animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
      transition={{ duration: 0.35 }}
      aria-label={`${fmt.format(pontos)} pontos`}
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.75, bgcolor: tokens.ink, color: tokens.lime,
        fontWeight: 700, fontSize: large ? 16 : 14, borderRadius: 999, px: large ? 2 : 1.5, py: large ? 1.25 : 1, whiteSpace: "nowrap",
      }}
    >
      <SparkIcon sx={{ fontSize: large ? 18 : 16 }} />
      {fmt.format(pontos)}
      {suffix ? ` ${suffix}` : null}
    </Box>
  );
}
