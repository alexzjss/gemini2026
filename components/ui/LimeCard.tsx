import Paper, { type PaperProps } from "@mui/material/Paper";

/** Card destaque (`lime`, borda 2px, sombra sólida). */
export default function LimeCard({ sx, ...props }: PaperProps) {
  return <Paper variant="highlight" sx={{ p: { xs: "18px", md: 3 }, borderRadius: { xs: "20px", md: "24px" }, display: "flex", flexDirection: "column", gap: 1.25, ...sx }} {...props} />;
}
