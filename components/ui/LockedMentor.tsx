import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "./Avatar";
import { formatPontos } from "./PointsPill";
import { tokens } from "@/lib/theme";

/** Vitrine de mentor bloqueado: avatar com cadeado, nome oculto, cargo visível. */
export default function LockedMentor({ cargo, organizacao, nivel, faltam }: { cargo: string; organizacao: string; nivel: number; faltam: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: "16px", border: `2px dashed ${tokens.ink}`, bgcolor: tokens.paper }}>
      <Avatar locked label={`Mentor bloqueado, abre no nível ${nivel}`} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{cargo} · {organizacao}</Typography>
        <Typography sx={{ fontSize: 13, color: tokens.muted }}>
          abre no nível {nivel}{faltam > 0 ? ` · faltam ${formatPontos(faltam)} pts` : ""}
        </Typography>
      </Box>
    </Box>
  );
}
