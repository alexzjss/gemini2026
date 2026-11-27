import Box from "@mui/material/Box";
import { tokens } from "@/lib/theme";

type Bg = "paper" | "blue" | "ink";

const FULL = "calc(100dvh - var(--demobar-h, 0px))";

/** Tela cheia sem navegação (Da Galera, quiz, mentor simulado, Match Day).
 *  Mobile: ocupa a tela toda (CTA colado embaixo). Desktop: coluna central legível, com respiro
 *  em cima/embaixo; `stretch` mantém a altura cheia (chat). `aside` vira coluna lateral fixa. */
export default function FullscreenFlow({
  bg = "paper", children, maxWidth = 760, aside, stretch = false,
}: { bg?: Bg; children: React.ReactNode; maxWidth?: number; aside?: React.ReactNode; stretch?: boolean }) {
  const c = { paper: [tokens.paper, tokens.ink], blue: [tokens.blue, tokens.white], ink: [tokens.ink, tokens.paper] }[bg];
  return (
    <Box sx={{ minHeight: FULL, bgcolor: c[0], color: c[1], display: "flex", justifyContent: "center" }}>
      <Box sx={{
        width: "100%", display: "grid", gap: { xs: 0, md: 5, lg: 7 },
        gridTemplateColumns: { xs: "1fr", md: aside ? `minmax(0, ${maxWidth}px) minmax(280px, 380px)` : `minmax(0, ${maxWidth}px)` },
        justifyContent: "center", px: { xs: 0, md: 4 }, pt: { md: 3 }, alignItems: "start",
      }}>
        <Box component="main" id="conteudo" sx={{
          minWidth: 0, display: "flex", flexDirection: "column",
          minHeight: { xs: FULL, md: stretch ? `calc(${FULL} - 24px)` : "min(760px, calc(100dvh - var(--demobar-h, 0px) - 48px))" },
          pb: { md: stretch ? 0 : 4 },
        }}>
          {children}
        </Box>
        {aside && (
          <Box component="aside" sx={{
            display: { xs: "none", md: "block" }, pt: 2.5, position: "sticky", top: "calc(var(--demobar-h, 0px) + 24px)",
            animation: "g26-fade-up 360ms cubic-bezier(.2,.8,.2,1) 120ms backwards",
          }}>
            {aside}
          </Box>
        )}
      </Box>
    </Box>
  );
}
