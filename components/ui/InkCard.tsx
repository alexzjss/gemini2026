import Paper, { type PaperProps } from "@mui/material/Paper";

/** Card escuro (`ink`), texto `paper`, sem borda. */
export default function InkCard({ sx, ...props }: PaperProps) {
  return <Paper variant="ink" sx={{ p: { xs: "18px", md: 3 }, borderRadius: { xs: "20px", md: "24px" }, display: "flex", flexDirection: "column", gap: 1.5, ...sx }} {...props} />;
}
