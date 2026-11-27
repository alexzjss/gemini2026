/* Tema MUI — tokens de docs/09-design-system.md.
 * Dono: Agente 1. ÚNICO lugar com hex no projeto: componentes usam `tokens`
 * ou `theme.palette.*`. */
import { createTheme, alpha } from "@mui/material/styles";
import type { SkillLevel } from "./types";

export const tokens = {
  paper: "#F4F1EA",
  ink: "#16150F",
  surface: "#FFFFFF",
  blue: "#3045F0",
  blueSoft: "#8F9BF5",
  blueTint: "#DCE1FF",
  lime: "#CFF24A",
  muted: "#59564C",
  mutedOnInk: "#C9C5B8",
  track: "#E7E3D8",
  trackOnInk: "#3A3830",
  inkRaised: "#2A2922",
  inkBorder: "#4A483F",
  danger: "#E2483D",
  mutedDim: "#8A8670",
  white: "#FFFFFF",
  onBlueSubtle: "rgba(255,255,255,.14)",
  onBlueFuture: "rgba(255,255,255,.25)",
} as const;

/** Cores da marca Próxio (prancha "Identidade e Design System").
 * Usadas só no símbolo/logotipo, manifest e ícones; a UI segue `tokens`. */
export const brand = {
  navy: "#0A1630",
  azul: "#4169FF",
  lima: "#C8F45D",
  neve: "#F8FBFF",
} as const;

export const fonts = {
  display: "var(--font-display), 'Bricolage Grotesque', system-ui, sans-serif",
  body: "var(--font-body), Inter, system-ui, sans-serif",
  /** Sora: só no logotipo "Próxio". */
  brand: "var(--font-brand), Sora, system-ui, sans-serif",
} as const;

export const border = `2px solid ${tokens.ink}`;
export const borderDashed = `2px dashed ${tokens.ink}`;
export const hardShadow = `4px 4px 0 ${tokens.ink}`;
export const hardShadowSm = `2px 2px 0 ${tokens.ink}`;
export const hardShadowLg = `6px 6px 0 ${tokens.ink}`;

/** Movimento: rápido e discreto (docs/09). Tudo respeita prefers-reduced-motion. */
export const motion = {
  ease: "cubic-bezier(.2,.8,.2,1)",
  fast: 140,
  base: 220,
} as const;
const tr = (props: string[], ms: number = motion.fast) => props.map((p) => `${p} ${ms}ms ${motion.ease}`).join(", ");

/** Larguras de layout compartilhadas pelos shells. */
export const layout = {
  sidebar: 248,
  content: 1200,
  contentTeacher: 1280,
} as const;

/** Cores das células/chips por nível de habilidade (09 §Níveis). */
export const skillLevelColors: Record<SkillLevel | "sem_dado", { bg: string; fg: string; border?: string }> = {
  dominada: { bg: tokens.blue, fg: tokens.white },
  em_desenvolvimento: { bg: tokens.blueSoft, fg: tokens.ink },
  defasagem: { bg: tokens.lime, fg: tokens.ink, border: tokens.ink },
  sem_dado: { bg: tokens.track, fg: tokens.muted },
};

/** Cor do topo dos cards de carreira (`career.diaACor`). */
export const diaACor = {
  blue: { bg: tokens.blue, fg: tokens.white, sub: tokens.blueTint },
  lime: { bg: tokens.lime, fg: tokens.ink, sub: tokens.muted },
  ink: { bg: tokens.ink, fg: tokens.paper, sub: tokens.mutedOnInk },
} as const;

/* ---------- Augmentations ---------- */
declare module "@mui/material/styles" {
  interface Palette { ink: Palette["primary"]; lime: Palette["primary"]; tokens: typeof tokens; }
  interface PaletteOptions { ink?: PaletteOptions["primary"]; lime?: PaletteOptions["primary"]; tokens?: typeof tokens; }
  interface TypographyVariants { display: React.CSSProperties; scenario: React.CSSProperties; }
  type ResponsiveCss = React.CSSProperties & Record<`@media ${string}`, React.CSSProperties>;
  interface TypographyVariantsOptions { display?: ResponsiveCss; scenario?: ResponsiveCss; }
}
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides { display: true; scenario: true; }
}
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides { ink: true; lime: true; }
  interface ButtonPropsSizeOverrides { xl: true; }
}
declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides { ink: true; lime: true; }
}
declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides { ink: true; lime: true; }
}
declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides { ink: true; highlight: true; flat: true; }
}
declare module "@mui/material/LinearProgress" {
  interface LinearProgressPropsColorOverrides { lime: true; }
}

const focusRing = {
  outline: `3px solid ${tokens.blue}`,
  outlineOffset: 2,
};

export const theme = createTheme({
  cssVariables: false,
  palette: {
    mode: "light",
    primary: { main: tokens.blue, contrastText: tokens.white },
    secondary: { main: tokens.lime, contrastText: tokens.ink },
    ink: { main: tokens.ink, light: tokens.inkRaised, dark: "#000000", contrastText: tokens.white },
    lime: { main: tokens.lime, light: tokens.lime, dark: "#B8DA2F", contrastText: tokens.ink },
    error: { main: tokens.danger, contrastText: tokens.white },
    text: { primary: tokens.ink, secondary: tokens.muted, disabled: tokens.mutedDim },
    background: { default: tokens.paper, paper: tokens.surface },
    divider: tokens.ink,
    tokens,
  },
  shape: { borderRadius: 20 },
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  typography: {
    fontFamily: fonts.body,
    fontSize: 15,
    body1: { fontSize: 16, lineHeight: 1.45 },
    body2: { fontSize: 15, lineHeight: 1.45 },
    caption: { fontSize: 13, lineHeight: 1.4 },
    display: {
      fontFamily: fonts.display, fontWeight: 800, fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em",
      "@media (min-width:900px)": { fontSize: 56 },
    },
    scenario: {
      fontFamily: fonts.display, fontWeight: 800, fontSize: 30, lineHeight: 1.08,
      "@media (min-width:900px)": { fontSize: 40 },
    },
    h1: { fontFamily: fonts.display, fontWeight: 800, fontSize: 40, lineHeight: 1, letterSpacing: "-0.02em", "@media (min-width:900px)": { fontSize: 56 } },
    h2: { fontFamily: fonts.display, fontWeight: 800, fontSize: 24, lineHeight: 1.1, "@media (min-width:900px)": { fontSize: 32 } },
    h3: { fontFamily: fonts.display, fontWeight: 800, fontSize: 22, lineHeight: 1.1, "@media (min-width:900px)": { fontSize: 24 } },
    h4: { fontFamily: fonts.display, fontWeight: 800, fontSize: 20, lineHeight: 1.1 },
    h5: { fontFamily: fonts.display, fontWeight: 600, fontSize: 18, lineHeight: 1.2 },
    h6: { fontFamily: fonts.body, fontWeight: 700, fontSize: 16, lineHeight: 1.3 },
    subtitle1: { fontWeight: 700, fontSize: 16 },
    subtitle2: { fontWeight: 600, fontSize: 14 },
    overline: { fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.4, textTransform: "uppercase" },
    button: { fontWeight: 700, textTransform: "none", fontSize: 16 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { WebkitTextSizeAdjust: "100%", scrollBehavior: "smooth" },
        body: { backgroundColor: tokens.paper, color: tokens.ink, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" },
        "::selection": { backgroundColor: tokens.lime, color: tokens.ink },
        "img, svg": { verticalAlign: "middle" },
        "@keyframes g26-fade-up": { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "none" } },
        "@keyframes g26-fade": { from: { opacity: 0 }, to: { opacity: 1 } },
        "@keyframes g26-grow": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "@keyframes g26-pop": { from: { opacity: 0, transform: "translateY(6px) scale(.97)" }, to: { opacity: 1, transform: "none" } },
        /* Entrada de página: o wrapper aparece e os blocos de 1º/2º nível sobem em cascata curta. */
        ".g26-page": { animation: `g26-fade ${motion.base}ms ${motion.ease}` },
        ".g26-page > * > *": { animation: `g26-fade-up 320ms ${motion.ease} backwards` },
        ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [
          `.g26-page > * > *:nth-of-type(${n})`, { animationDelay: `${(n - 1) * 35}ms` },
        ])),
        ".g26-page > * > *:nth-of-type(n+9)": { animationDelay: "280ms" },
        "a": { color: "inherit" },
        ":focus-visible": focusRing,
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": { animationDuration: "0.01ms !important", transitionDuration: "0.01ms !important", scrollBehavior: "auto !important" },
        },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { variant: "contained", disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 48,
          paddingInline: 22,
          border,
          boxShadow: "none",
          transition: tr(["transform", "box-shadow", "background-color", "color", "border-color"]),
          "&:focus-visible": focusRing,
          "& .MuiButton-endIcon": { transition: tr(["transform"]) },
          "&:hover .MuiButton-endIcon": { transform: "translateX(3px)" },
          "&.Mui-disabled": {
            border: borderDashed,
            background: "transparent",
            color: tokens.muted,
            boxShadow: "none",
          },
        },
        sizeLarge: { minHeight: 56, fontSize: 17, paddingInline: 26 },
        sizeSmall: { minHeight: 36, fontSize: 14, paddingInline: 14 },
        contained: {
          boxShadow: hardShadow,
          "&:hover": { boxShadow: hardShadowLg, transform: "translate(-2px,-2px)" },
          "&:active": { boxShadow: hardShadowSm, transform: "translate(2px,2px)", transitionDuration: "60ms" },
        },
        outlined: {
          backgroundColor: tokens.surface,
          color: tokens.ink,
          "&:hover": { border, backgroundColor: tokens.paper },
        },
        text: { border: "2px solid transparent", "&:hover": { backgroundColor: alpha(tokens.ink, 0.06) } },
      },
      variants: [
        { props: { size: "xl" }, style: { minHeight: 56, fontSize: 17, paddingInline: 28 } },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          width: 44, height: 44, transition: tr(["transform", "background-color", "color"]),
          "&:hover": { transform: "scale(1.06)" },
          "&:active": { transform: "scale(.94)" },
          "&:focus-visible": focusRing,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          transition: tr(["transform", "box-shadow", "background-color", "border-color"], 180),
          /* Card clicável (link/botão): levanta com sombra sólida, afunda no clique. */
          "&:is(a, button)": {
            cursor: "pointer",
            "&:hover": { transform: "translate(-2px,-2px)", boxShadow: hardShadow },
            "&:active": { transform: "translate(1px,1px)", boxShadow: hardShadowSm, transitionDuration: "60ms" },
          },
        },
        rounded: { borderRadius: 20 },
      },
      variants: [
        { props: { variant: "outlined" }, style: { border, backgroundColor: tokens.surface } },
        { props: { variant: "flat" }, style: { backgroundColor: tokens.surface } },
        { props: { variant: "ink" }, style: { backgroundColor: tokens.ink, color: tokens.paper } },
        { props: { variant: "highlight" }, style: { backgroundColor: tokens.lime, color: tokens.ink, border, boxShadow: hardShadow } },
      ],
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 20, "@media (min-width:900px)": { borderRadius: 24 } } },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 18, "&:last-child": { paddingBottom: 18 }, "@media (min-width:900px)": { padding: 24, "&:last-child": { paddingBottom: 24 } } } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600, fontSize: 14, height: 36, transition: tr(["background-color", "transform", "box-shadow"]) },
        clickable: { "&:active": { transform: "scale(.96)" } },
        outlined: { border, backgroundColor: tokens.surface, color: tokens.ink },
        sizeSmall: { height: 26, fontSize: 12, fontWeight: 700 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 10, borderRadius: 999, backgroundColor: tokens.track },
        bar: { borderRadius: 999, transition: `transform 600ms ${motion.ease}` },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: { root: { height: "auto", backgroundColor: tokens.surface, borderTop: border, padding: "8px 8px 20px" } },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 0, minHeight: 48, padding: 0, gap: 4, color: tokens.muted,
          "& .MuiBottomNavigationAction-label": { fontSize: 12, fontWeight: 600, "&.Mui-selected": { fontSize: 12, fontWeight: 700 } },
          "&.Mui-selected": { color: tokens.ink },
          "&:focus-visible": focusRing,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border, borderRadius: 18, textTransform: "none", color: tokens.ink, backgroundColor: tokens.surface,
          transition: tr(["transform", "box-shadow", "background-color"]),
          "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: tokens.lime, color: tokens.ink, boxShadow: hardShadow, transform: "translate(-2px,-2px)" },
        },
      },
    },
    MuiTextField: { defaultProps: { variant: "outlined", fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16, backgroundColor: tokens.surface, transition: tr(["box-shadow"]),
          "&.Mui-focused": { boxShadow: `0 0 0 4px ${alpha(tokens.blue, 0.14)}` },
          "& .MuiOutlinedInput-notchedOutline": { border },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.ink },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: tokens.blue, borderWidth: 3 },
        },
        input: { minHeight: 24 },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: tokens.muted, "&.Mui-focused": { color: tokens.blue } } } },
    MuiDialog: {
      styleOverrides: {
        paper: { border, borderRadius: 24, boxShadow: hardShadowLg, backgroundColor: tokens.surface, animation: `g26-pop ${motion.base}ms ${motion.ease}` },
        container: { backdropFilter: "blur(2px)" },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontFamily: fonts.display, fontWeight: 800, fontSize: 24 } } },
    MuiDialogContent: { styleOverrides: { root: { paddingInline: 24 } } },
    MuiDialogActions: { styleOverrides: { root: { padding: "8px 24px 24px", gap: 8 } } },
    MuiBackdrop: { styleOverrides: { root: { "&:not(.MuiBackdrop-invisible)": { backgroundColor: alpha(tokens.ink, 0.45) } } } },
    MuiTooltip: { defaultProps: { arrow: true, enterDelay: 250 }, styleOverrides: { arrow: { color: tokens.ink }, tooltip: { backgroundColor: tokens.ink, color: tokens.paper, fontSize: 13, borderRadius: 8, padding: "6px 10px" } } },
    MuiSnackbarContent: { styleOverrides: { root: { backgroundColor: tokens.ink, color: tokens.paper, borderRadius: 14, fontWeight: 600 } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: border, backgroundColor: tokens.surface } } },
    MuiLink: { defaultProps: { underline: "always" }, styleOverrides: { root: { color: tokens.ink, fontWeight: 600, "&:focus-visible": focusRing } } },
    MuiRadio: { styleOverrides: { root: { color: tokens.ink, "&.Mui-checked": { color: tokens.blue } } } },
    MuiCheckbox: { styleOverrides: { root: { color: tokens.ink, "&.Mui-checked": { color: tokens.blue } } } },
    MuiSkeleton: { defaultProps: { animation: "wave" }, styleOverrides: { root: { backgroundColor: tokens.track, borderRadius: 14 } } },
    MuiMenu: { styleOverrides: { paper: { border, borderRadius: 16, boxShadow: hardShadow, marginTop: 6 }, list: { padding: 6 } } },
    MuiMenuItem: { styleOverrides: { root: { borderRadius: 10, minHeight: 40, fontWeight: 500, transition: tr(["background-color"]), "&.Mui-selected": { backgroundColor: alpha(tokens.lime, 0.6), fontWeight: 700 }, "&.Mui-selected:hover, &:hover": { backgroundColor: tokens.paper } } } },
    MuiPopover: { styleOverrides: { paper: { border, borderRadius: 16, boxShadow: hardShadow } } },
  },
});

export default theme;
