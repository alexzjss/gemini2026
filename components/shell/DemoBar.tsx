"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useActions, useAppStore } from "@/lib/store/AppStore";
import { DEMO } from "@/lib/config";
import { tokens } from "@/lib/theme";
import OfflineBadge from "./OfflineBadge";

export const DEMOBAR_HEIGHT = 40;

const ctrl = {
  height: 30, minHeight: 30, fontSize: 12, fontWeight: 700, borderRadius: 999, px: 1.25, border: 0, boxShadow: "none",
  whiteSpace: "nowrap", flex: "none",
} as const;

/** Faixa de modo demo (só com NEXT_PUBLIC_DEMO_MODE ≠ 0). */
export default function DemoBar() {
  const { state, dispatch } = useAppStore();
  const { now, resetDemo } = useActions();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!DEMO.enabled) return null;

  const sessao = state.sessao;
  const perfilAtual = sessao?.role === "professor" ? "prof" : sessao?.role === "aluno" ? sessao.studentId : "";

  const trocar = (v: string) => {
    if (v === "prof") { dispatch({ type: "loginProfessor" }); router.push(`/professor/turma/${DEMO.turmaPadrao}`); return; }
    if (!v) { dispatch({ type: "logout" }); router.push("/"); return; }
    dispatch({ type: "login", studentId: v, at: now() });
    router.push("/aluno");
  };

  const simular = () => {
    if (sessao?.role !== "aluno") return;
    dispatch({ type: "simulateSemester", studentId: sessao.studentId, at: now() });
    router.push("/aluno/match");
  };

  return (
    <>
      <Box role="region" aria-label="Barra do modo demo" sx={{
        position: "sticky", top: 0, zIndex: 1300, height: DEMOBAR_HEIGHT, bgcolor: tokens.ink, color: tokens.lime,
        display: "flex", alignItems: "center", gap: 1, px: { xs: 1.5, md: 2.5 }, overflowX: "auto", overflowY: "hidden",
        scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
      }}>
        <Box component="span" sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", flex: "none" }}>Modo demo</Box>
        <Select
          size="small" value={perfilAtual} displayEmpty onChange={(e) => trocar(String(e.target.value))}
          inputProps={{ "aria-label": "Trocar perfil da demo" }}
          sx={{
            ...ctrl, px: 0, bgcolor: tokens.inkRaised, color: tokens.paper,
            "& .MuiSelect-select": { py: 0, pl: 1.5, fontSize: 12, fontWeight: 700, minHeight: "auto !important" },
            "& .MuiOutlinedInput-notchedOutline": { border: `1px solid ${tokens.inkBorder} !important` },
            "& .MuiSvgIcon-root": { color: tokens.paper },
          }}
        >
          <MenuItem value="">Sair (tela inicial)</MenuItem>
          {DEMO.herois.map((h) => <MenuItem key={h.id} value={h.id}>{h.label}</MenuItem>)}
          <MenuItem value="prof">Professor(a) · 2º EM A</MenuItem>
        </Select>
        {sessao?.role === "aluno" && (
          <Button onClick={simular} color="lime" sx={ctrl}>Simular fim do semestre</Button>
        )}
        <Button onClick={() => setConfirm(true)} variant="text" sx={{ ...ctrl, color: tokens.paper, border: `1px solid ${tokens.inkBorder}` }}>Resetar dados</Button>
        <Box sx={{ ml: "auto", flex: "none" }}><OfflineBadge /></Box>
      </Box>
      <Dialog open={confirm} onClose={() => setConfirm(false)} aria-labelledby="reset-title">
        <DialogTitle id="reset-title">Resetar a demo?</DialogTitle>
        <DialogContent>
          <DialogContentText>Apaga o progresso salvo neste navegador (pontos, respostas, planos e conversas) e volta tudo ao estado inicial do seed.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setConfirm(false)}>Cancelar</Button>
          <Button color="ink" onClick={() => { resetDemo(); setConfirm(false); router.push("/"); }}>Resetar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
