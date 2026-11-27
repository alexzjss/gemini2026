"use client";
/* Fluxo de cenários (Da Galera e Desafio da semana) — telas 4 e 6. */
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { FullscreenFlow } from "@/components/shell";
import { OptionCard, SegmentedProgress } from "@/components/ui";
import type { Scenario } from "@/lib/types";
import { border, hardShadow, tokens } from "@/lib/theme";
import FlowHeader from "./FlowHeader";

export default function ScenarioFlow({
  titulo, cenarios, respostas, inicio, bg = "blue", ultimoLabel, onAnswer, onFinish, aside,
}: {
  titulo: string; cenarios: Scenario[]; respostas: Record<string, string>; inicio: number; bg?: "blue" | "ink";
  ultimoLabel: string; onAnswer: (id: string, key: string) => void; onFinish: () => void; aside?: (i: number) => React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(Math.min(Math.max(0, inicio), cenarios.length - 1));
  const grupo = useRef<HTMLDivElement>(null);
  const c = cenarios[i];
  if (!c) return null;
  const escolhida = respostas[c.id];
  const ultimo = i === cenarios.length - 1;

  const avancar = () => {
    if (!escolhida) return;
    if (ultimo) onFinish();
    else setI(i + 1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const keys = c.opcoes.map((o) => o.key);
    const idx = keys.indexOf(escolhida as (typeof keys)[number]);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); onAnswer(c.id, keys[(idx + 1 + keys.length) % keys.length]); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); onAnswer(c.id, keys[(idx - 1 + keys.length) % keys.length]); }
    else if (/^[1-4]$/.test(e.key)) onAnswer(c.id, keys[Number(e.key) - 1]);
    else if (/^[a-dA-D]$/.test(e.key)) onAnswer(c.id, e.key.toUpperCase());
    else if (e.key === "Enter") { e.preventDefault(); avancar(); }
  };

  const fg = tokens.white;
  return (
    <FullscreenFlow bg={bg} aside={aside?.(i)}>
      <FlowHeader tone={bg === "blue" ? "onBlue" : "onInk"} titulo={titulo} label="Sair e continuar depois" direita={<span aria-hidden>{i + 1}/{cenarios.length}</span>} />
      <Box sx={{ px: 2.5, pt: 1 }}>
        <SegmentedProgress total={cenarios.length} atual={i + 1} label={`Cenário ${i + 1} de ${cenarios.length}`} />
      </Box>
      <AnimatePresence mode="wait">
        <Box key={c.id} component={motion.section} aria-label={`Cenário ${i + 1} de ${cenarios.length}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, px: 2.5, pt: 3 }}>
          <Box><Box component="span" sx={{ display: "inline-block", bgcolor: tokens.lime, color: tokens.ink, fontWeight: 700, fontSize: 13, borderRadius: 999, px: 1.5, py: 0.5 }}>{c.quando}</Box></Box>
          <Typography id={`enunciado-${c.id}`} variant="scenario" component="h1" sx={{ color: fg }}>{c.enunciado}</Typography>
          <Box ref={grupo} role="radiogroup" aria-labelledby={`enunciado-${c.id}`} onKeyDown={onKey} sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {c.opcoes.map((o, k) => (
              <OptionCard key={o.key} letra={o.key} label={o.label} state={escolhida === o.key ? "selected" : "idle"}
                tabIndex={escolhida ? (escolhida === o.key ? 0 : -1) : k === 0 ? 0 : -1}
                onSelect={() => onAnswer(c.id, o.key)} />
            ))}
          </Box>
        </Box>
      </AnimatePresence>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography sx={{ fontSize: 14, color: bg === "blue" ? tokens.blueTint : tokens.mutedOnInk, textAlign: "center" }}>
          Não tem resposta certa e ninguém vai te dar nota aqui.
        </Typography>
        <Button size="large" color="secondary" onClick={avancar} disabled={!escolhida} endIcon={escolhida ? <ArrowForwardRoundedIcon /> : undefined}
          sx={{ "&.Mui-disabled": { borderColor: bg === "blue" ? tokens.blueTint : tokens.inkBorder, color: bg === "blue" ? tokens.blueTint : tokens.mutedOnInk }, boxShadow: escolhida ? hardShadow : "none", border }}>
          {escolhida ? (ultimo ? ultimoLabel : "Próximo cenário") : "Escolha uma opção"}
        </Button>
      </Box>
    </FullscreenFlow>
  );
}
