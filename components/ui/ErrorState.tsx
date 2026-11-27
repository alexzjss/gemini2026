import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PillButton from "./PillButton";
import { border, tokens } from "@/lib/theme";

/** Estado de erro/vazio amigável — nunca mostra stack trace. */
export default function ErrorState({
  titulo = "Ops, algo travou aqui.",
  texto = "Já salvamos seu progresso. Tenta de novo ou volta pro início.",
  acao, href = "/", rotulo = "Voltar pro início",
}: { titulo?: string; texto?: string; acao?: () => void; href?: string; rotulo?: string }) {
  return (
    <Box role="alert" sx={{ m: { xs: 2.5, md: 5 }, p: 3, borderRadius: "20px", border, bgcolor: tokens.surface, display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 560 }}>
      <Typography variant="h3" component="h1">{titulo}</Typography>
      <Typography sx={{ color: tokens.muted }}>{texto}</Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        {acao && <PillButton color="ink" onClick={acao}>Tentar de novo</PillButton>}
        <PillButton variant="outlined" href={href}>{rotulo}</PillButton>
      </Box>
    </Box>
  );
}
