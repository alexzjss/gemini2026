import Typography, { type TypographyProps } from "@mui/material/Typography";

export default function Overline(props: TypographyProps) {
  return <Typography variant="overline" component="span" display="block" {...props} />;
}
