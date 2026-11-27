import Box from "@mui/material/Box";
import { motion, tokens } from "@/lib/theme";

/** N segmentos de 6px. `onBlue`: feito lime/atual branco/futuro translúcido.
 *  `onLight`: feito blue/atual ink/futuro track. */
export default function SegmentedProgress({
  total, atual, variant = "onBlue", label,
}: { total: number; atual: number; variant?: "onBlue" | "onLight" | "onInk"; label?: string }) {
  const cores = variant === "onLight"
    ? { feito: tokens.blue, atual: tokens.ink, futuro: tokens.track }
    : { feito: tokens.lime, atual: tokens.white, futuro: tokens.onBlueFuture };
  return (
    <Box
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={atual}
      aria-label={label ?? `${atual} de ${total}`}
      sx={{ display: "grid", gridTemplateColumns: `repeat(${total}, minmax(0,1fr))`, gap: "4px" }}
    >
      {Array.from({ length: total }, (_, i) => (
        <Box key={i} sx={{ height: 6, borderRadius: 999, transition: `background-color ${motion.base}ms ${motion.ease}`, bgcolor: i + 1 < atual ? cores.feito : i + 1 === atual ? cores.atual : cores.futuro }} />
      ))}
    </Box>
  );
}
