import MuiAvatar from "@mui/material/Avatar";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { border, tokens } from "@/lib/theme";

/** Círculo 44px `blue`, inicial branca, borda 2px. `locked`: cadeado sobre `track`. */
export default function Avatar({
  inicial, size = 44, locked = false, tone = "blue", label,
}: { inicial?: string; size?: number; locked?: boolean; tone?: "blue" | "lime" | "ink"; label?: string }) {
  const bg = locked ? tokens.track : tone === "lime" ? tokens.lime : tone === "ink" ? tokens.ink : tokens.blue;
  const fg = locked || tone === "lime" ? tokens.ink : tokens.white;
  return (
    <MuiAvatar aria-label={label} aria-hidden={label ? undefined : true}
      sx={{ width: size, height: size, bgcolor: bg, color: fg, border, fontWeight: 700, fontSize: Math.round(size * 0.4) }}>
      {locked ? <LockRoundedIcon sx={{ fontSize: Math.round(size * 0.45) }} /> : inicial}
    </MuiAvatar>
  );
}
