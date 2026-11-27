"use client";
/* Tela 8 — Detalhe da carreira. Mentores disponíveis: "Quero no meu Match Day"; bloqueados: cadeado e "abre no nível N". */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { Avatar, BnccChip, ErrorState, LockedMentor, Overline, PillButton, SurfaceCard } from "@/components/ui";
import { CareerTop } from "@/components/aluno/blocos";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { getCareer, getSkill } from "@/lib/store/seed";
import { combina as calcCombina } from "@/lib/domain/carreiras";
import { NIVEIS, NIVEL_HABILIDADE_LABEL } from "@/lib/config";
import { border, diaACor, fonts, hardShadow, skillLevelColors, tokens } from "@/lib/theme";

export default function CarreiraDetalhe() {
  const { id } = useParams<{ id: string }>();
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { dispatch, now } = useActions();
  const career = getCareer(id);
  if (!career) return <ErrorState titulo="Não achamos essa carreira." texto="Bora ver as outras?" href="/aluno/carreiras" rotulo="Ver carreiras" />;
  if (!view || !studentId) return null;

  const salva = view.swipe.salvas.includes(career.id);
  const quero = view.swipe.queroConhecer.includes(career.id);
  const combina = view.perfil ? calcCombina(view.perfil, career) : [];
  const status = (code: string) => view.skills.find((s) => s.code === code);
  const destaque = career.skills.find((c) => status(c)?.level !== "dominada") ?? career.skills[0];
  const mentores = view.mentores.filter((m) => m.mentor.careerIds.includes(career.id));
  const cor = diaACor[career.diaACor];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
      <Box component={NextLink} href="/aluno/carreiras" sx={{
        display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 700, color: tokens.ink, minHeight: 44, alignSelf: "flex-start",
        mt: { md: -1.5 }, mb: -1, textUnderlineOffset: 3, "& svg": { transition: "transform 140ms cubic-bezier(.2,.8,.2,1)" }, "&:hover svg": { transform: "translateX(-3px)" },
      }}>
        <ArrowBackRoundedIcon fontSize="small" /> Carreiras
      </Box>
      <Box sx={{ border, borderRadius: { xs: "20px", md: "24px" }, overflow: "hidden", boxShadow: hardShadow }}>
        <CareerTop career={career} combina={combina} sx={{ pt: { md: 4 }, px: { md: 4 } }} />
        <Box sx={{ bgcolor: cor.bg, px: { xs: 2.5, md: 4 }, pb: { xs: 2.5, md: 4 }, pt: { md: 1 }, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <PillButton variant="outlined" size="small" startIcon={salva ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
            onClick={() => (salva ? dispatch({ type: "unsave", studentId, careerId: career.id }) : dispatch({ type: "swipe", studentId, careerId: career.id, kind: "save", at: now() }))}>
            {salva ? "Salva" : "Salvar"}
          </PillButton>
          <PillButton size="small" color={quero ? "secondary" : "ink"} disabled={quero}
            onClick={() => dispatch({ type: "swipe", studentId, careerId: career.id, kind: "want", at: now() })}
            sx={quero ? { "&.Mui-disabled": { bgcolor: tokens.lime, color: tokens.ink, border, borderStyle: "solid" } } : undefined}>
            {quero ? "Quero conhecer ✓" : "Quero conhecer"}
          </PillButton>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: { xs: 2, md: 3 }, alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
          <SurfaceCard component="section" aria-labelledby="raiox">
            <Typography id="raiox" variant="h4" component="h2">Raio-x de um dia</Typography>
            {career.raioX.map((r) => (
              <Box key={r.t} sx={{ display: "flex", gap: 1.5 }}>
                <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, minWidth: 42 }}>{r.t}</Typography>
                <Typography>{r.what}</Typography>
              </Box>
            ))}
          </SurfaceCard>
          <SurfaceCard component="section" aria-labelledby="escola">
            <Typography id="escola" variant="h4" component="h2">Onde a escola aparece</Typography>
            {career.skills.map((code) => {
              const s = status(code);
              const lv = skillLevelColors[s?.level ?? "sem_dado"];
              const top = code === destaque;
              return (
                <Box key={code} sx={{ display: "flex", flexDirection: "column", gap: 0.75, p: top ? 1.5 : 0, borderRadius: "14px", bgcolor: top ? tokens.paper : "transparent", border: top ? border : 0 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <BnccChip code={code} />
                    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{getSkill(code)?.descricaoJovem}</Typography>
                  </Box>
                  {career.escola[code] && <Typography sx={{ fontSize: 14, color: tokens.muted }}>{career.escola[code]}</Typography>}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Box component="span" sx={{ fontSize: 12, fontWeight: 700, px: 1, py: 0.25, borderRadius: "6px", bgcolor: lv.bg, color: lv.fg, border: lv.border ? `1px solid ${lv.border}` : 0 }}>
                      {s ? NIVEL_HABILIDADE_LABEL[s.level] : "sem dado no boletim"}
                    </Box>
                    {top && s?.level !== "dominada" && <PillButton href={`/aluno/missoes/${code}`} size="small" color="ink" arrow>Treinar essa</PillButton>}
                  </Box>
                </Box>
              );
            })}
          </SurfaceCard>
          <SurfaceCard component="section" aria-labelledby="chegar">
            <Typography id="chegar" variant="h4" component="h2">Como chegar</Typography>
            <Typography>{career.comoChegar}</Typography>
          </SurfaceCard>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 3 } }}>
          <SurfaceCard component="section" aria-labelledby="mentores">
            <Typography id="mentores" variant="h4" component="h2">Mentores reais dessa área</Typography>
            {mentores.length === 0 && <Typography sx={{ color: tokens.muted }}>Ainda não temos mentores dessa área. O mentor simulado já pode tirar suas dúvidas.</Typography>}
            {mentores.map(({ mentor: m, aberto, preferido }) =>
              aberto ? (
                <Box key={m.id} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, pl: 2, borderRadius: "16px", border, flexWrap: "wrap", rowGap: 1.25 }}>
                  <Avatar inicial={m.inicial} />
                  <Box sx={{ flex: 1, minWidth: 160 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{m.cargo} · {m.organizacao}</Typography>
                    <Typography sx={{ fontSize: 13, color: tokens.muted }}>perfil ilustrativo · disponível</Typography>
                  </Box>
                  <PillButton size="small" variant={preferido ? "contained" : "outlined"} color={preferido ? "secondary" : "primary"} aria-pressed={preferido}
                    onClick={() => dispatch({ type: "preferMentor", studentId, mentorId: m.id })}>
                    {preferido ? "Na sua lista ✓" : "Quero no meu Match Day"}
                  </PillButton>
                </Box>
              ) : (
                <LockedMentor key={m.id} cargo={m.cargo} organizacao={m.organizacao} nivel={m.nivelMinimo}
                  faltam={Math.max(0, (NIVEIS.find((n) => n.id === m.nivelMinimo)?.min ?? 0) - view.pontos)} />
              ),
            )}
          </SurfaceCard>
          <Box component={NextLink} href={`/aluno/carreiras/${career.id}/mentor-simulado`}
            sx={{
              display: "flex", alignItems: "center", gap: 2, p: { xs: 2.5, md: 3 }, borderRadius: { xs: "20px", md: "24px" }, bgcolor: tokens.ink, color: tokens.paper,
              textDecoration: "none", border, transition: "transform 140ms cubic-bezier(.2,.8,.2,1), box-shadow 140ms cubic-bezier(.2,.8,.2,1)",
              "&:hover": { transform: "translate(-2px,-2px)", boxShadow: `4px 4px 0 ${tokens.lime}` },
              "&:active": { transform: "translate(1px,1px)", boxShadow: "none" },
            }}>
            <Box aria-hidden sx={{ width: 44, height: 44, flex: "none", borderRadius: "12px", bgcolor: tokens.lime, color: tokens.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><ChatRoundedIcon /></Box>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>Conversar com um mentor simulado</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.mutedOnInk }}>IA · tira dúvida e faz um mini-desafio valendo pontos</Typography>
            </Box>
          </Box>
          <Overline sx={{ color: tokens.muted }}>Nenhuma carreira fica bloqueada por nota.</Overline>
        </Box>
      </Box>
    </Box>
  );
}
