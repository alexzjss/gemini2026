import Box from "@mui/material/Box";
import { tokens } from "@/lib/theme";

type Tone = "lime" | "ink" | "blue" | "inkOnLime";

/** Chip de código BNCC (Inter 12/700, raio 6px). */
export default function BnccChip({ code, tone = "lime", sx }: { code: string; tone?: Tone; sx?: object }) {
  const c = {
    lime: { bg: tokens.lime, fg: tokens.ink },
    ink: { bg: tokens.ink, fg: tokens.lime },
    inkOnLime: { bg: tokens.ink, fg: tokens.lime },
    blue: { bg: tokens.blue, fg: tokens.white },
  }[tone];
  return (
    <Box component="span" sx={{ display: "inline-block", fontSize: 12, fontWeight: 700, lineHeight: 1.3, borderRadius: "6px", px: 1, py: 0.5, bgcolor: c.bg, color: c.fg, whiteSpace: "nowrap", ...sx }}>
      {code}
    </Box>
  );
}
