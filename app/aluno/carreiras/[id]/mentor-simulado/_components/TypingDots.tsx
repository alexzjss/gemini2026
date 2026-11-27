"use client";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/material/styles";
import { tokens } from "@/lib/theme";

const bounce = keyframes`0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}`;

/** 3 pontos animados enquanto a IA "digita" (substituem as barras de áudio do M-Live). */
export default function TypingDots({ label }: { label?: string }) {
  return (
    <Box role={label ? "status" : undefined} aria-label={label} sx={{ display: "inline-flex", gap: "5px", alignItems: "center", height: 16 }}>
      {[0, 1, 2].map((i) => (
        <Box key={i} component="span" sx={{
          width: 8, height: 8, borderRadius: "50%", bgcolor: tokens.lime, animation: `${bounce} 1s ${i * 0.15}s infinite ease-in-out`,
          "@media (prefers-reduced-motion: reduce)": { animation: "none", opacity: 0.8 },
        }} />
      ))}
    </Box>
  );
}
