"use client";

import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import Stack from "./Stack";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import type { LessonPlan } from "@/lib/types";
import { Cartao } from "./comum";
import { cores, fonteDisplay } from "./cores";

interface Props {
  selo: LessonPlan["seloEtico"];
  somenteLeitura: boolean;
  onMudar: (selo: LessonPlan["seloEtico"]) => void;
  onVerCitacao: (n: number) => void;
}

/**
 * Selo Referencial de IA na Educação (docs/10 §16). A IA sugere se cada
 * critério é atendido; quem confirma é o professor (human-in-the-loop).
 */
export default function EthicsSeal({ selo, somenteLeitura, onMudar, onVerCitacao }: Props) {
  const verificado = selo.length > 0 && selo.every((c) => c.atendido);

  return (
    <Cartao component="section" aria-labelledby="titulo-selo" sx={{ bgcolor: verificado ? cores.lime : cores.surface }}>
      <Stack gap={1.5}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <VerifiedRoundedIcon sx={{ color: verificado ? cores.ink : cores.mutedDim }} aria-hidden />
          <Stack>
            <Typography id="titulo-selo" component="h2" sx={{ fontFamily: fonteDisplay, fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>
              Selo Referencial de IA na Educação
            </Typography>
            <Typography role="status" sx={{ fontSize: 13, fontWeight: 600, color: verificado ? cores.ink : cores.muted }}>
              {verificado ? "Verificado: todos os critérios conferidos por você." : "Confira cada critério. O selo só vale com todos marcados."}
            </Typography>
          </Stack>
        </Stack>

        <Stack component="ul" gap={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
          {selo.map((c, i) => (
            <Box
              component="li"
              key={`${c.criterio}-${i}`}
              sx={{ bgcolor: cores.surface, border: `2px solid ${cores.ink}`, borderRadius: "14px", px: 1.5, py: 1 }}
            >
              <FormControlLabel
                sx={{ alignItems: "flex-start", m: 0, width: "100%" }}
                control={
                  <Checkbox
                    checked={c.atendido}
                    disabled={somenteLeitura}
                    onChange={(e) => onMudar(selo.map((x, j) => (j === i ? { ...x, atendido: e.target.checked } : x)))}
                    sx={{ mt: -0.5, color: cores.ink, "&.Mui-checked": { color: cores.blue } }}
                  />
                }
                label={
                  <Stack gap={0.25} sx={{ pt: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{c.criterio}</Typography>
                    <Typography sx={{ fontSize: 13, color: cores.muted }}>{c.comoAtende}</Typography>
                  </Stack>
                }
              />
              {c.citacao != null && (
                <Box sx={{ pl: 5.25, pb: 0.5 }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onVerCitacao(c.citacao!)}
                    sx={{
                      font: "inherit",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      bgcolor: cores.paper,
                      border: `1.5px solid ${cores.ink}`,
                      borderRadius: "6px",
                      px: 0.75,
                      py: 0.25,
                      "&:focus-visible": { outline: `3px solid ${cores.blue}`, outlineOffset: 2 },
                    }}
                  >
                    Ver citação [{c.citacao}]
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Cartao>
  );
}
