import Box from "@mui/material/Box";
import { tokens } from "@/lib/theme";

type Bg = "paper" | "blue" | "ink";

/** Tela cheia sem navegação (Da Galera, quiz, mentor simulado, Match Day). */
export default function FullscreenFlow({
  bg = "paper", children, maxWidth = 560, aside,
}: { bg?: Bg; children: React.ReactNode; maxWidth?: number; aside?: React.ReactNode }) {
  const c = { paper: [tokens.paper, tokens.ink], blue: [tokens.blue, tokens.white], ink: [tokens.ink, tokens.paper] }[bg];
  return (
    <Box sx={{ minHeight: "calc(100dvh - var(--demobar-h, 0px))", bgcolor: c[0], color: c[1], display: "flex", justifyContent: "center" }}>
      <Box sx={{
        width: "100%", maxWidth: aside ? 1120 : maxWidth, display: "grid", gap: { xs: 0, md: 5 },
        gridTemplateColumns: { xs: "1fr", md: aside ? `minmax(0, ${maxWidth}px) minmax(0, 1fr)` : "1fr" },
        px: { xs: 0, md: aside ? 5 : 0 }, alignItems: "start",
      }}>
        <Box component="main" id="conteudo" sx={{ minWidth: 0, display: "flex", flexDirection: "column", minHeight: "calc(100dvh - var(--demobar-h, 0px))" }}>
          {children}
        </Box>
        {aside && <Box component="aside" sx={{ display: { xs: "none", md: "block" }, pt: 6 }}>{aside}</Box>}
      </Box>
    </Box>
  );
}
