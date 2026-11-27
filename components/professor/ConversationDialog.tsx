"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import Stack from "./Stack";
import { useEffect, useState } from "react";
import { cores } from "./cores";

const LIMITE = 280;

interface Props {
  aberto: boolean;
  nome: string;
  motivos: string[];
  onFechar: () => void;
  onConfirmar: (nota: string) => void;
}

/** "Conversei" (docs/07 §7, docs/10 §14): data automática + nota livre ≤ 280. */
export default function ConversationDialog({ aberto, nome, motivos, onFechar, onConfirmar }: Props) {
  const [nota, setNota] = useState("");
  useEffect(() => {
    if (aberto) setNota("");
  }, [aberto]);

  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });

  return (
    <Dialog
      open={aberto}
      onClose={onFechar}
      aria-labelledby="titulo-conversa"
      slotProps={{ paper: { sx: { border: `2px solid ${cores.ink}`, borderRadius: "20px", boxShadow: `4px 4px 0 ${cores.ink}`, width: 440, maxWidth: "calc(100vw - 32px)" } } }}
    >
      <DialogTitle id="titulo-conversa" sx={{ fontWeight: 800, pb: 1 }}>
        Conversa com {nome}
      </DialogTitle>
      <DialogContent>
        <Stack gap={2}>
          <Typography sx={{ fontSize: 14, color: cores.muted }}>
            Registro de {hoje}. O alerta passa para “acompanhando” e só volta se aparecer um sinal novo. O aluno não vê
            este registro.
          </Typography>
          {motivos.length > 0 && (
            <Stack component="ul" sx={{ m: 0, pl: 2.5, fontSize: 14 }} gap={0.5}>
              {motivos.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </Stack>
          )}
          <TextField
            autoFocus
            label="Nota (opcional)"
            placeholder="Ex.: ficou doente na semana 4, já está voltando. Combinamos reforço na quinta."
            multiline
            minRows={3}
            value={nota}
            onChange={(e) => setNota(e.target.value.slice(0, LIMITE))}
            helperText={`${nota.length}/${LIMITE}`}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onFechar} sx={{ color: cores.ink, fontWeight: 700, textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirmar(nota.trim())}
          sx={{ borderRadius: 999, fontWeight: 700, textTransform: "none", bgcolor: cores.ink, border: `2px solid ${cores.ink}`, "&:hover": { bgcolor: cores.ink } }}
        >
          Registrar conversa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
