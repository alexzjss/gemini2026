"use client";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";
import { useAppStore } from "@/lib/store/AppStore";
import { tokens } from "@/lib/theme";

/** "IA offline": aparece quando alguma resposta da sessão veio do fallback. */
export default function OfflineBadge() {
  const { ui } = useAppStore();
  if (!ui.aiOffline) return null;
  return (
    <Tooltip title="A IA não respondeu a tempo. Estamos usando respostas prontas — a demo segue normal.">
      <Box component="span" role="status" tabIndex={0} sx={{
        display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: tokens.lime, color: tokens.ink, borderRadius: 999,
        px: 1.25, height: 26, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
      }}>
        <CloudOffRoundedIcon sx={{ fontSize: 16 }} /> IA offline
      </Box>
    </Tooltip>
  );
}
