"use client";
/* MatchDayCard (F7.2/F7.4). Exportado para o Agente 4 usar no Início (tela 3, item 5). */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { useRouter } from "next/navigation";
import { Overline, PillButton, SurfaceCard } from "@/components/ui";
import { useActions } from "@/lib/store/AppStore";
import type { StudentView } from "@/lib/store/selectors";
import { getMentor } from "@/lib/store/seed";
import { DEMO, LIMIARES } from "@/lib/config";
import { fonts, tokens } from "@/lib/theme";
import { dataMatchDay, diasParaMatchDay } from "./datas";

export default function MatchDayCard({ view }: { view: StudentView }) {
  const { dispatch, now } = useActions();
  const router = useRouter();
  const mentor = view.match?.eligible && view.match.mentorId ? getMentor(view.match.mentorId) : undefined;
  const dias = diasParaMatchDay();
  const jaSimulou = view.local.eventos.some((e) => e.type === "presenca_semana");
  const s = view.snapshot;

  const itens = [
    { ok: s.galeraConcluido, txt: "Terminar o Da Galera" },
    { ok: s.missoes >= LIMIARES.match.missoesMinimas, txt: "Fazer pelo menos 1 missão BNCC" },
    { ok: s.frequenciaMedia >= LIMIARES.match.frequenciaMinima, txt: `Frequência do semestre acima de ${LIMIARES.match.frequenciaMinima}%` },
  ];

  const simular = () => {
    dispatch({ type: "simulateSemester", studentId: view.student.id, at: now() });
    router.push("/aluno/match");
  };

  return (
    <SurfaceCard component="section" aria-label="Match Day">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
        <Overline>Match Day · {dataMatchDay()}</Overline>
        {!mentor && !jaSimulou && (
          <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 22 }}>{dias} {dias === 1 ? "dia" : "dias"}</Typography>
        )}
      </Box>

      {mentor ? (
        <>
          <Typography variant="h3" component="h2">Seu match: {mentor.cargo}</Typography>
          <Typography sx={{ color: tokens.muted }}>{mentor.organizacao}</Typography>
          {view.match?.agendadoPara && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 600 }}>
              <EventAvailableRoundedIcon sx={{ color: tokens.blue }} aria-hidden /> Conversa marcada: {view.match.agendadoPara}
            </Box>
          )}
          <Box><PillButton href="/aluno/match" color="ink" arrow>Ver</PillButton></Box>
        </>
      ) : (
        <>
          <Typography variant="h3" component="h2">No fim do semestre, seu esforço vira conversa com um(a) mentor(a) de verdade.</Typography>
          <Box component="ul" aria-label="O que falta pro Match Day" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {itens.map((it) => (
              <Box component="li" key={it.txt} sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 15 }}>
                {it.ok
                  ? <CheckCircleRoundedIcon sx={{ color: tokens.blue }} titleAccess="feito" />
                  : <RadioButtonUncheckedRoundedIcon sx={{ color: tokens.muted }} titleAccess="falta" />}
                <span>{it.txt}</span>
              </Box>
            ))}
          </Box>
          {jaSimulou ? (
            <Box><PillButton href="/aluno/match" color="ink" arrow>Abrir o Match Day</PillButton></Box>
          ) : DEMO.enabled ? (
            <Box><PillButton color="ink" onClick={simular}>Simular fim do semestre</PillButton></Box>
          ) : null}
        </>
      )}
    </SurfaceCard>
  );
}
