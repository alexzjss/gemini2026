import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BnccChip } from "@/components/ui";
import { tokens } from "@/lib/theme";

/** Chip `lime` do mini-desafio: código + "+20 pts se você explicar" (ou resolvido) e, aberto, o enunciado. */
export default function MiniChallengeChip({ code, enunciado, resolvido = false }: { code: string; enunciado?: string; resolvido?: boolean }) {
  const chip = (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1, borderRadius: "12px", px: 1.5, py: 1.25, fontSize: 13, fontWeight: 600,
      bgcolor: resolvido ? "transparent" : tokens.lime, color: resolvido ? tokens.lime : tokens.ink,
      border: `2px solid ${tokens.lime}`,
    }}>
      <BnccChip code={code} tone="ink" sx={{ fontSize: 11, px: 0.75, py: 0.375 }} />
      {resolvido ? "Mini-desafio resolvido ✓ +20 pts" : "Mini-desafio: +20 pts se você explicar"}
    </Box>
  );
  if (resolvido || !enunciado) return chip;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {chip}
      <Typography sx={{
        bgcolor: tokens.inkRaised, color: tokens.paper, border: `2px solid ${tokens.lime}`,
        borderRadius: "18px 18px 18px 4px", px: 2, py: 1.5, fontSize: 15, fontWeight: 600, lineHeight: 1.45,
      }}>
        {enunciado}
      </Typography>
    </Box>
  );
}
