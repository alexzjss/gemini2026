import Box from "@mui/material/Box";
import { border, tokens } from "@/lib/theme";

/** "Pular para o conteúdo" — visível só no foco. */
export default function SkipLink() {
  return (
    <Box component="a" href="#conteudo" sx={{
      position: "absolute", left: 12, top: -80, zIndex: 2000, bgcolor: tokens.lime, color: tokens.ink, border, borderRadius: 999,
      px: 2, py: 1, fontWeight: 700, textDecoration: "none", "&:focus": { top: 8 },
    }}>
      Pular para o conteúdo
    </Box>
  );
}
