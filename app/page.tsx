"use client";
/* Landing/login (tela 1). Versão funcional da fundação; o Agente 4 refina o visual (F5.3). */
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo, PillButton } from "@/components/ui";
import { useActions } from "@/lib/store/AppStore";
import { getStudentByMatricula } from "@/lib/store/seed";
import { DEMO } from "@/lib/config";
import { border, hardShadowLg, tokens } from "@/lib/theme";

export default function Landing() {
  const router = useRouter();
  const { dispatch, now } = useActions();
  const [matricula, setMatricula] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = (m: string) => {
    const s = getStudentByMatricula(m);
    if (!s) { setErro("Não achamos essa matrícula. Confere com a secretaria?"); return; }
    setCarregando(true);
    dispatch({ type: "login", studentId: s.id, at: now() });
    router.push("/aluno");
  };

  return (
    <Box component="main" id="conteudo" className="g26-page" sx={{
      minHeight: "calc(100dvh - var(--demobar-h, 0px))", bgcolor: tokens.blue, color: tokens.white,
      display: "flex", justifyContent: "center", alignItems: { md: "center" }, px: { xs: 2.5, md: 6 }, py: { xs: 4, md: 8 },
    }}>
      <Box sx={{
        width: "100%", maxWidth: { xs: 480, md: 1080 }, display: "grid", gap: { xs: 3.5, md: 8 },
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.15fr) minmax(360px, 440px)" }, alignItems: "center",
      }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3.5, md: 4 } }}>
          <Box><Logo onBlue size={26} /></Box>
          <Typography variant="h1" sx={{ color: tokens.white, fontSize: { md: 64, lg: 72 }, maxWidth: 620 }}>Bora descobrir pra onde a escola te leva.</Typography>
          <Typography sx={{ display: { xs: "none", md: "block" }, color: tokens.blueTint, fontSize: 18, maxWidth: 520 }}>
            Sua ficha BNCC, carreiras que combinam com você, missões curtas e um Match Day com mentores de verdade. Nota não bloqueia nada.
          </Typography>
          {DEMO.enabled && (
            <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 1 }}>
              <Atalhos onEntrar={entrar} />
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); entrar(matricula); }}
            sx={{ bgcolor: tokens.surface, color: tokens.ink, border, borderRadius: "24px", boxShadow: hardShadowLg, p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h3" component="h2" sx={{ display: { xs: "none", md: "block" }, mb: 0.5 }}>Entrar</Typography>
            <TextField
              label="Sua matrícula" value={matricula} autoComplete="off"
              onChange={(e) => { setMatricula(e.target.value.replace(/\D/g, "")); setErro(""); }}
              error={Boolean(erro)} helperText={erro || "Tá no seu boletim. Ex.: 2026001"}
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
            />
            <Button type="submit" color="secondary" size="large" loading={carregando} disabled={!matricula && !carregando}>Entrar</Button>
            <Link component="button" type="button" onClick={() => { dispatch({ type: "loginProfessor" }); router.push(`/professor/turma/${DEMO.turmaPadrao}`); }}
              sx={{ alignSelf: "center", fontSize: 15, minHeight: 44, textUnderlineOffset: 3 }}>
              Sou professor(a) — entrar na demo
            </Link>
          </Box>
          {DEMO.enabled && (
            <Box sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1 }}>
              <Atalhos onEntrar={entrar} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function Atalhos({ onEntrar }: { onEntrar: (m: string) => void }) {
  return (
    <>
      <Typography variant="overline" sx={{ color: tokens.blueTint }}>Atalhos da demo</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {DEMO.herois.map((h) => (
          <PillButton key={h.id} size="small" variant="outlined" onClick={() => onEntrar(h.matricula)}
            sx={{ boxShadow: "none", "&:hover": { bgcolor: tokens.lime, boxShadow: "none" } }}>{h.label}</PillButton>
        ))}
      </Box>
    </>
  );
}
