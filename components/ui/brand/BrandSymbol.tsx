import { brand, tokens } from "@/lib/theme";
import { SIMBOLO_PATHS, SIMBOLO_RATIO, SIMBOLO_VIEWBOX } from "./simbolo";

/**
 * Onde o símbolo vai ser pintado. Cada fundo troca só o que some nele:
 * - `light`: cores originais (fundos claros: papel, branco, gelo).
 * - `dark`: corpo navy vira claro (fundos ink/navy).
 * - `blue`: asa azul vira branca (fundo azul da landing).
 * - `mono`: tudo em `currentColor` (selos, impressão, estados desabilitados).
 */
export type BrandTone = "light" | "dark" | "blue" | "mono";

const CORES: Record<Exclude<BrandTone, "mono">, { asaAlta: string; asasBaixas: string; corpo: string }> = {
  light: { asaAlta: brand.azul, asasBaixas: brand.lima, corpo: brand.navy },
  dark: { asaAlta: brand.azul, asasBaixas: brand.lima, corpo: brand.neve },
  blue: { asaAlta: tokens.white, asasBaixas: brand.lima, corpo: brand.navy },
};

export interface BrandSymbolProps {
  /** Altura em px. A largura segue a proporção do desenho. */
  size?: number;
  tone?: BrandTone;
  /** Texto para leitor de tela. Vazio = decorativo (quando o nome já está ao lado). */
  title?: string;
  className?: string;
}

/** Símbolo Próxio (pássaro) em SVG: nítido em qualquer tamanho e recolorível por fundo. */
export default function BrandSymbol({ size = 32, tone = "light", title = "", className }: BrandSymbolProps) {
  const c = tone === "mono" ? { asaAlta: "currentColor", asasBaixas: "currentColor", corpo: "currentColor" } : CORES[tone];
  const decorativo = !title;
  return (
    <svg
      viewBox={SIMBOLO_VIEWBOX}
      width={Math.round(size * SIMBOLO_RATIO)}
      height={size}
      className={className}
      role={decorativo ? undefined : "img"}
      aria-hidden={decorativo || undefined}
      focusable="false"
      style={{ display: "block", flex: "none" }}
    >
      {title && <title>{title}</title>}
      <path fill={c.asaAlta} fillOpacity={tone === "mono" ? 0.55 : 1} d={SIMBOLO_PATHS.asaAlta} />
      <path fill={c.asasBaixas} fillOpacity={tone === "mono" ? 0.8 : 1} d={SIMBOLO_PATHS.asasBaixas} />
      <path fill={c.corpo} d={SIMBOLO_PATHS.corpo} />
    </svg>
  );
}
