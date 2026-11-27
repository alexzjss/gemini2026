import Box from "@mui/material/Box";
import { APP_NAME } from "@/lib/config";
import { borderDashed, fonts, tokens } from "@/lib/theme";

/** Logotipo placeholder (contorno tracejado, como nos designs). */
export default function Logo({ onBlue = false, size = 15 }: { onBlue?: boolean; size?: number }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", fontFamily: fonts.display, fontWeight: 800, fontSize: size,
        letterSpacing: "0.02em", borderRadius: 999, px: 1.5, py: 0.75,
        border: onBlue ? `2px dashed ${tokens.white}` : borderDashed,
        color: onBlue ? tokens.white : tokens.ink, whiteSpace: "nowrap",
      }}
    >
      {APP_NAME}
    </Box>
  );
}
