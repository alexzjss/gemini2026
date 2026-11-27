/**
 * Tokens de cor usados pela UI do professor (docs/09).
 *
 * TEMPORÁRIO: `lib/theme.ts` (Agente 1) é a fonte única de tokens. Quando ele
 * exportar os tokens, troque o objeto abaixo por um re-export, por exemplo:
 *   export { tokens as cores } from "@/lib/theme";
 * Nenhum outro arquivo desta pasta usa hex direto.
 */
export const cores = {
  paper: "#F4F1EA",
  ink: "#16150F",
  surface: "#FFFFFF",
  blue: "#3045F0",
  blueSoft: "#8F9BF5",
  blueTint: "#DCE1FF",
  lime: "#CFF24A",
  muted: "#59564C",
  track: "#E7E3D8",
  danger: "#E2483D",
  mutedDim: "#8A8670",
} as const;

export const fonteDisplay = "var(--font-bricolage), 'Bricolage Grotesque', system-ui, sans-serif";
