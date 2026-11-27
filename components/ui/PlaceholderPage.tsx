import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { border, tokens } from "@/lib/theme";

const ROTAS: [string, string][] = [
  ["/aluno", "Início"], ["/aluno/galera", "Da Galera"], ["/aluno/galera/resultado", "Resultado"], ["/aluno/semana", "Desafio da semana"],
  ["/aluno/carreiras", "Carreiras"], ["/aluno/carreiras/analista-dados-esportivos", "Detalhe da carreira"],
  ["/aluno/carreiras/analista-dados-esportivos/mentor-simulado", "Mentor simulado"], ["/aluno/missoes", "Missões"],
  ["/aluno/missoes/EM13MAT316", "Quiz"], ["/aluno/perfil", "Perfil"], ["/aluno/match", "Match Day"],
];

/** Placeholder de rota (F1.7) — a frente dona substitui o conteúdo. */
export default function PlaceholderPage({ titulo, frente, children }: { titulo: string; frente: string; children?: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
      <Typography variant="overline" component="p">Em construção · {frente}</Typography>
      <Typography variant="h1">{titulo}</Typography>
      {children}
      <Box component="nav" aria-label="Rotas da demo" sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {ROTAS.map(([href, label]) => (
          <Box key={href} component={NextLink} href={href} sx={{ border, borderRadius: 999, px: 1.5, py: 0.75, fontSize: 14, fontWeight: 600, textDecoration: "none", bgcolor: tokens.surface, color: tokens.ink }}>
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
