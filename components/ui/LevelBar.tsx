import Box from "@mui/material/Box";
import { tokens } from "@/lib/theme";

/** Trilho 14px `trackOnInk`, preenchimento `lime`. `value` 0–1. */
export default function LevelBar({ value, label, onLight = false }: { value: number; label: string; onLight?: boolean }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}
      sx={{ height: 14, borderRadius: 999, bgcolor: onLight ? tokens.track : tokens.trackOnInk, overflow: "hidden", border: onLight ? `2px solid ${tokens.ink}` : 0 }}>
      <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: onLight ? tokens.blue : tokens.lime, borderRadius: 999, transition: "width 600ms ease-out" }} />
    </Box>
  );
}
