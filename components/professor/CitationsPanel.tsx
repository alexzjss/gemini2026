"use client";

import { Box, Typography } from "@mui/material";
import Stack from "./Stack";
import { useEffect, useRef } from "react";
import type { LessonPlan } from "@/lib/types";
import { BnccChip, Overline } from "./comum";
import { cores, fonteDisplay } from "./cores";

/**
 * Painel de citações RAG (docs/10 §16). Mostra o `trecho` exatamente como a
 * rota devolveu (texto do chunk do corpus) — esta tela nunca reescreve nem
 * resume texto oficial (CLAUDE.md regras 6 e 7).
 */
export default function CitationsPanel({ citacoes, ativa }: { citacoes: LessonPlan["citacoes"]; ativa: { n: number; k: number } | null }) {
  const itens = useRef<Record<number, HTMLLIElement | null>>({});

  useEffect(() => {
    if (ativa == null) return;
    const el = itens.current[ativa.n];
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    el?.focus({ preventScroll: true });
  }, [ativa]);

  return (
    <Box
      component="aside"
      aria-labelledby="titulo-citacoes"
      sx={{
        bgcolor: cores.surface,
        border: `2px solid ${cores.ink}`,
        borderRadius: "20px",
        p: 2,
        position: { md: "sticky" },
        top: { md: 24 },
        maxHeight: { md: "calc(100vh - 48px)" },
        overflowY: { md: "auto" },
      }}
    >
      <Stack gap={0.5} sx={{ mb: 1.5 }}>
        <Typography id="titulo-citacoes" component="h2" sx={{ fontFamily: fonteDisplay, fontWeight: 800, fontSize: 20 }}>
          Citações
        </Typography>
        <Typography sx={{ fontSize: 13, color: cores.muted }}>
          Trechos oficiais recuperados da BNCC e do Referencial de IA na Educação (MEC). Texto fixo, não editável.
        </Typography>
      </Stack>
      {citacoes.length === 0 ? (
        <Typography sx={{ fontSize: 14, color: cores.muted }}>Nenhuma citação veio com este plano.</Typography>
      ) : (
        <Stack component="ol" gap={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {citacoes.map((c) => {
            const destaque = ativa?.n === c.n;
            return (
              <Box
                component="li"
                key={c.n}
                id={`citacao-${c.n}`}
                tabIndex={-1}
                ref={(el: HTMLLIElement | null) => {
                  itens.current[c.n] = el;
                }}
                sx={{
                  border: `2px solid ${destaque ? cores.ink : cores.track}`,
                  bgcolor: destaque ? cores.paper : cores.surface,
                  boxShadow: destaque ? `3px 3px 0 ${cores.ink}` : "none",
                  borderRadius: "14px",
                  p: 1.5,
                  outline: "none",
                  transition: "box-shadow 160ms ease-out, border-color 160ms ease-out",
                  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  <Typography component="span" sx={{ fontWeight: 800, fontSize: 14 }}>
                    [{c.n}]
                  </Typography>
                  <BnccChip code={c.ref} tom={/^EM13/.test(c.ref) ? "lime" : "ink"} />
                </Stack>
                <Box
                  component="blockquote"
                  sx={{ m: 0, pl: 1.25, borderLeft: `3px solid ${cores.ink}`, fontSize: 14, lineHeight: 1.5 }}
                >
                  {c.trecho}
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Overline>{c.fonte}</Overline>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
