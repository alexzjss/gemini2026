"use client";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { PillButton } from "@/components/ui";
import { border, tokens } from "@/lib/theme";

/** 3 horários fictícios (radio) → Confirmar. Sem chamada externa. */
export default function ScheduleDialog({
  open, horarios, mentorLabel, onClose, onConfirm,
}: { open: boolean; horarios: string[]; mentorLabel: string; onClose: () => void; onConfirm: (h: string) => void }) {
  const [escolha, setEscolha] = useState(horarios[0] ?? "");
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="agendar-title" fullWidth maxWidth="xs">
      <DialogTitle id="agendar-title">Agendar conversa</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: tokens.muted, mb: 2 }}>Conversa de 20 minutos com {mentorLabel}, na escola, com um professor junto.</Typography>
        <RadioGroup aria-labelledby="agendar-title" value={escolha} onChange={(e) => setEscolha(e.target.value)} sx={{ gap: 1 }}>
          {horarios.map((h) => (
            <FormControlLabel key={h} value={h} control={<Radio />} label={h}
              sx={{ m: 0, minHeight: 52, px: 1, borderRadius: "16px", border, bgcolor: escolha === h ? tokens.lime : tokens.surface, "& .MuiFormControlLabel-label": { fontWeight: 700 } }} />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <PillButton variant="outlined" onClick={onClose}>Agora não</PillButton>
        <PillButton color="ink" disabled={!escolha} onClick={() => onConfirm(escolha)}>Confirmar</PillButton>
      </DialogActions>
    </Dialog>
  );
}
