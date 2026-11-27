import Box from "@mui/material/Box";
import { BnccChip } from "@/components/ui";
import { tokens } from "@/lib/theme";

/** Chip `lime` do mini-desafio: código + "+20 pts se você explicar" (ou resolvido). */
export default function MiniChallengeChip({ code, resolvido = false }: { code: string; resolvido?: boolean }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1, borderRadius: "12px", px: 1.5, py: 1.25, fontSize: 13, fontWeight: 600,
      bgcolor: resolvido ? "transparent" : tokens.lime, color: resolvido ? tokens.lime : tokens.ink,
      border: `2px solid ${tokens.lime}`,
    }}>
      <BnccChip code={code} tone="ink" sx={{ fontSize: 11, px: 0.75, py: 0.375 }} />
      {resolvido ? "Mini-desafio resolvido ✓ +20 pts" : "Mini-desafio: +20 pts se você explicar"}
    </Box>
  );
}
