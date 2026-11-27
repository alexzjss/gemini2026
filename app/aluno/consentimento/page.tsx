"use client";
/* Consentimento (tela 2). Versão funcional da fundação; o Agente 4 refina (F5.3). */
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import DatasetRoundedIcon from "@mui/icons-material/DatasetRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FullscreenFlow } from "@/components/shell";
import { PillButton, SurfaceCard } from "@/components/ui";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { border, tokens } from "@/lib/theme";

const ITENS = [
  { Icon: DatasetRoundedIcon, t: "O que a gente usa", d: <>Seu boletim, sua frequência e o que você responde aqui.</> },
  { Icon: ExploreRoundedIcon, t: "Pra quê", d: <>Te mostrar caminhos e o que destravar. <strong>Suas notas nunca bloqueiam nenhuma carreira.</strong></> },
  { Icon: VisibilityRoundedIcon, t: "Quem vê", d: <>Você e seu professor. Mentores só veem seu primeiro nome e o que você curte.</> },
  { Icon: AutoAwesomeRoundedIcon, t: "IA no meio", d: <>Algumas partes usam IA (Gemini). O mentor simulado é uma IA, não uma pessoa.</> },
];

export default function Consentimento() {
  const studentId = useSessionStudentId();
  const { dispatch, now } = useActions();
  const router = useRouter();
  const [aberto, setAberto] = useState(false);

  return (
    <FullscreenFlow bg="paper">
      <Box sx={{ px: 2.5, py: { xs: 3, md: 6 }, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h1">Antes de começar, o combinado.</Typography>
        {ITENS.map(({ Icon, t, d }) => (
          <SurfaceCard key={t} sx={{ flexDirection: "row", alignItems: "flex-start", gap: 1.75 }}>
            <Box aria-hidden sx={{ width: 44, height: 44, flex: "none", borderRadius: "12px", bgcolor: tokens.lime, border, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h4" component="h2" sx={{ mb: 0.5 }}>{t}</Typography>
              <Typography sx={{ color: tokens.muted, "& strong": { color: tokens.ink } }}>{d}</Typography>
            </Box>
          </SurfaceCard>
        ))}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
          <PillButton size="large" arrow onClick={() => { if (studentId) { dispatch({ type: "consent", studentId, at: now() }); router.replace("/aluno"); } }}>Bora</PillButton>
          <Link component="button" type="button" onClick={() => setAberto(true)} sx={{ alignSelf: "center", minHeight: 44 }}>Ler a versão completa</Link>
        </Box>
      </Box>
      <Dialog open={aberto} onClose={() => setAberto(false)} aria-labelledby="lgpd-title" scroll="paper">
        <DialogTitle id="lgpd-title">O combinado, completo</DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 1.5, "& p": { m: 0 } }}>
          <Typography>Esta é uma demonstração com dados 100% fictícios. Numa escola de verdade, o tratamento segue a LGPD (Lei 13.709/2018) e o ECA: dados de adolescentes são usados só no melhor interesse do estudante, com a escola como responsável.</Typography>
          <Typography><strong>Dados usados:</strong> notas por avaliação, frequência semanal e suas respostas na plataforma. Nada de localização, contatos ou redes sociais.</Typography>
          <Typography><strong>Finalidade:</strong> mostrar caminhos, sugerir missões e montar o Match Day. Notas nunca escondem carreiras nem mentores.</Typography>
          <Typography><strong>Quem acessa:</strong> você e seus professores. Mentores veem só seu primeiro nome e seus interesses.</Typography>
          <Typography><strong>IA:</strong> o Gemini recebe um código no lugar do seu nome, sua série, habilidades e afinidades. Ele nunca recebe nome, frequência nem sinais de atenção.</Typography>
          <Typography><strong>Seus direitos:</strong> pedir para ver, corrigir ou apagar seus dados a qualquer momento, pela escola.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><PillButton color="ink" onClick={() => setAberto(false)}>Entendi</PillButton></DialogActions>
      </Dialog>
    </FullscreenFlow>
  );
}
