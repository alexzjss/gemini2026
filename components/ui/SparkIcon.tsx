import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";

/** Estrela de 4 pontas dos pontos (desenho dos protótipos). */
export default function SparkIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" aria-hidden sx={{ fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinejoin: "round", ...props.sx }}>
      <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />
    </SvgIcon>
  );
}
