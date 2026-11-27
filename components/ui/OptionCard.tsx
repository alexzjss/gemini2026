"use client";
import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { border, borderDashed, fonts, hardShadow, tokens } from "@/lib/theme";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "disabled";

/** Opção de cenário/quiz: branco, borda 2px, raio 18, min-height 72, quadrado-letra 40px.
 *  Use dentro de um container `role="radiogroup"`. */
export default function OptionCard({
  letra, label, state = "idle", onSelect, tabIndex, onKeyDown, id,
}: {
  letra: string; label: string; state?: OptionState; onSelect?: () => void;
  tabIndex?: number; onKeyDown?: React.KeyboardEventHandler; id?: string;
}) {
  const selected = state === "selected";
  const correct = state === "correct";
  const wrong = state === "wrong";
  return (
    <ButtonBase
      id={id}
      role="radio"
      aria-checked={selected || correct || wrong}
      aria-disabled={state === "disabled" || undefined}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onClick={state === "disabled" ? undefined : onSelect}
      sx={{
        width: "100%", minHeight: 72, justifyContent: "flex-start", gap: 1.75, textAlign: "left", px: 1.75, py: 1.5,
        borderRadius: "18px", border: wrong ? borderDashed : border, color: correct ? tokens.white : tokens.ink,
        bgcolor: selected ? tokens.lime : correct ? tokens.blue : tokens.surface,
        boxShadow: selected || correct ? hardShadow : "none",
        transform: selected || correct ? "translate(-2px,-2px)" : "none",
        transition: "transform 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms",
        opacity: state === "disabled" ? 0.6 : 1,
        "&:focus-visible": { outline: `3px solid ${tokens.lime}`, outlineOffset: 2 },
      }}
    >
      <Box component="span" aria-hidden sx={{
        width: 40, height: 40, flex: "none", borderRadius: "12px", border, display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: correct ? tokens.white : tokens.paper, color: tokens.ink, fontFamily: fonts.display, fontWeight: 800, fontSize: 18,
      }}>
        {correct ? <CheckRoundedIcon fontSize="small" /> : letra}
      </Box>
      <Box component="span" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35 }}>{label}</Box>
    </ButtonBase>
  );
}
