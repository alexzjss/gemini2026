import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/lib/theme";
import { LIMIARES } from "@/lib/config";

export function rotuloAfinidade(v: number) {
  return v >= LIMIARES.afinidade.forte ? "forte" : v >= LIMIARES.afinidade.medio ? "médio" : "leve";
}

/** Barra de afinidade: trilho 10px `track`; forte = blue, médio/leve = blueSoft; rótulo à direita. */
export default function AffinityBar({ label, value, rotulo }: { label: string; value: number; rotulo?: string }) {
  const r = rotulo ?? rotuloAfinidade(value);
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
        <Typography component="span" sx={{ fontWeight: 600, fontSize: 15 }}>{label}</Typography>
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: tokens.muted }}>{r}</Typography>
      </Box>
      <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${label}: ${r}`}
        sx={{ height: 10, borderRadius: 999, bgcolor: tokens.track, overflow: "hidden" }}>
        <Box sx={{ width: `${pct}%`, height: "100%", borderRadius: 999, bgcolor: r === "forte" ? tokens.blue : tokens.blueSoft, transition: "width 500ms ease-out" }} />
      </Box>
    </Box>
  );
}
