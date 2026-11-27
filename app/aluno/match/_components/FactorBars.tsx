import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { MatchFactors } from "@/lib/types";
import { PESOS_MATCH } from "@/lib/config";
import { tokens } from "@/lib/theme";

const ROTULOS: { k: keyof MatchFactors; label: string }[] = [
  { k: "afinidade", label: "Afinidade" },
  { k: "carreira", label: "Carreira que você curtiu" },
  { k: "preferencia", label: "Você pediu" },
  { k: "evolucao", label: "Sua evolução" },
  { k: "engajamento", label: "Seu engajamento" },
];

const fmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/** 5 barras dos fatores do score (cada uma sobre o seu peso máximo). */
export default function FactorBars({ fatores }: { fatores: MatchFactors }) {
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {ROTULOS.map(({ k, label }) => {
        const max = PESOS_MATCH[k];
        const v = fatores[k];
        const pct = Math.round((v / max) * 100);
        return (
          <Box component="li" key={k} sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
              <Typography component="span" sx={{ fontWeight: 600, fontSize: 15 }}>{label}</Typography>
              <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: tokens.muted }}>{fmt.format(v)} de {max}</Typography>
            </Box>
            <Box role="progressbar" aria-label={`${label}: ${fmt.format(v)} de ${max}`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(v)}
              sx={{ height: 10, borderRadius: 999, bgcolor: tokens.track, overflow: "hidden" }}>
              <Box sx={{ width: `${pct}%`, height: "100%", borderRadius: 999, bgcolor: pct >= 65 ? tokens.blue : tokens.blueSoft }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
