import Paper, { type PaperProps } from "@mui/material/Paper";

/** Card claro (`surface`, borda 2px). */
export default function SurfaceCard({ sx, ...props }: PaperProps) {
  return <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: "20px", md: "24px" }, display: "flex", flexDirection: "column", gap: 1.5, ...sx }} {...props} />;
}
