import Box from "@mui/material/Box";
import type { Breakpoint } from "@mui/material/styles";
import NextLink from "next/link";
import { APP_NAME } from "@/lib/config";
import { brand, fonts, tokens } from "@/lib/theme";
import BrandSymbol, { type BrandTone } from "./brand/BrandSymbol";

const COR_NOME: Record<BrandTone, string> = {
  light: brand.navy,
  dark: brand.neve,
  blue: tokens.white,
  mono: "currentColor",
};

/** Esconde só visualmente: o nome continua para leitor de tela. */
const srOnly = {
  position: "absolute", width: 1, height: 1, p: 0, m: -1, overflow: "hidden",
  clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
} as const;

export interface LogoProps {
  /** `full` = símbolo + nome; `symbol` = só o pássaro. */
  variant?: "full" | "symbol";
  /** Abaixo desta largura de tela (breakpoint MUI ou px) o nome recolhe e fica só o símbolo. */
  collapseBelow?: Breakpoint | number;
  /** Fundo onde o logo está. Ver `BrandTone`. */
  tone?: BrandTone;
  /** Atalho legado para `tone="blue"` (landing). */
  onBlue?: boolean;
  /** Tamanho do nome em px; o símbolo acompanha (≈1,5×). */
  size?: number;
  /** Se informado, o logo vira link (ex.: volta pro início). */
  href?: string;
}

/** Logotipo Próxio: símbolo vetorial + nome em Sora 600, adaptado ao fundo e à largura da tela. */
export default function Logo({ variant = "full", collapseBelow, tone: toneProp, onBlue = false, size = 20, href }: LogoProps) {
  const tone: BrandTone = toneProp ?? (onBlue ? "blue" : "light");
  const symbolSize = Math.round(size * 1.5);
  const showName = variant === "full";

  const conteudo = (
    <>
      <BrandSymbol size={symbolSize} tone={tone} title={showName ? "" : APP_NAME} />
      {showName && (
        <Box
          component="span"
          sx={{
            fontFamily: fonts.brand, fontWeight: 600, fontSize: size, lineHeight: 1, letterSpacing: "-0.01em",
            color: COR_NOME[tone], whiteSpace: "nowrap",
            ...(collapseBelow && { [`@media (max-width:${breakpointMax(collapseBelow)}px)`]: srOnly }),
          }}
        >
          {APP_NAME}
        </Box>
      )}
    </>
  );

  const sx = {
    position: "relative", display: "inline-flex", alignItems: "center", gap: `${Math.round(size * 0.3)}px`,
    color: COR_NOME[tone], textDecoration: "none", borderRadius: "12px", flex: "none",
  } as const;

  if (href) {
    return (
      <Box component={NextLink} href={href} aria-label={`${APP_NAME}: início`} sx={{ ...sx, "&:focus-visible": { outline: `3px solid ${tone === "light" ? tokens.blue : tokens.lime}`, outlineOffset: 4 } }}>
        {conteudo}
      </Box>
    );
  }
  return <Box component="span" sx={sx}>{conteudo}</Box>;
}

/** Breakpoints padrão do MUI (lib/theme não os altera). */
function breakpointMax(bp: Breakpoint | number): number {
  const valores: Record<Breakpoint, number> = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 };
  return (typeof bp === "number" ? bp : valores[bp]) - 0.05;
}
