import Paper, { type PaperProps } from "@mui/material/Paper";

type Props = PaperProps & { component?: React.ElementType; href?: string };

/** Card claro (`surface`, borda 2px). Aceita `component` (ex.: NextLink) + `href`. */
export default function SurfaceCard({ sx, ...props }: Props) {
  return <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: { xs: "20px", md: "24px" }, display: "flex", flexDirection: "column", gap: 1.5, ...sx }} {...props} />;
}
