import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

/** Skeleton genérico com mensagem amigável (evita layout shift até o localStorage carregar). */
export default function LoadingState({ texto = "Carregando…", linhas = 3 }: { texto?: string; linhas?: number }) {
  return (
    <Box role="status" aria-live="polite" sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: { xs: 2.5, md: 5 } }}>
      <Typography sx={{ fontWeight: 600 }}>{texto}</Typography>
      {Array.from({ length: linhas }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={i === 0 ? 56 : 96} />
      ))}
    </Box>
  );
}
