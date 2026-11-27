"use client";
/* Tela 12 — Perfil / Ficha BNCC. Resumo da IA via /api/diagnostico (cache); opcional se offline. */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { useEffect, useRef } from "react";
import { Avatar, BnccChip, PillButton, SurfaceCard } from "@/components/ui";
import { LevelCard, MentorTiers, PointsTable } from "@/components/aluno/blocos";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { useApi } from "@/lib/store/api";
import { border, tokens } from "@/lib/theme";
import type { DiagnosticoAI } from "@/lib/types";

const CACHE = "diagnostico";

export default function Perfil() {
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { dispatch } = useActions();
  const callApi = useApi();
  const pedido = useRef(false);
  const resumo = view?.local.iaCache[CACHE] as DiagnosticoAI | undefined;

  useEffect(() => {
    if (!view || resumo || pedido.current) return;
    pedido.current = true;
    const body = {
      studentId: view.student.id, serie: view.student.serie,
      skills: view.skills.map((s) => ({ code: s.code, level: s.level, descricaoJovem: s.skill?.descricaoJovem ?? s.code })),
    };
    void callApi<DiagnosticoAI | null>("/api/diagnostico", body, () => null).then(({ data }) => {
      if (data?.resumo) dispatch({ type: "cacheAI", studentId: view.student.id, key: CACHE, value: data });
    });
  }, [view, resumo, callApi, dispatch]);

  if (!view) return null;
  const dominadas = view.skills.filter((s) => s.level === "dominada");
  const destravar = view.skills.filter((s) => s.level !== "dominada").sort((a, b) => a.progresso - b.progresso);
  const abertas = new Set([view.missaoDoDia?.code, ...view.sugestoes.map((s) => s?.code)].filter(Boolean));

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.4fr) minmax(300px, 1fr)" }, gap: { xs: 2.5, md: 3 }, alignItems: "start" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 }, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar inicial={view.student.inicial} size={56} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" component="p">{view.student.nome}</Typography>
            <Typography sx={{ color: tokens.muted }}>{view.student.serie}º ano · Ensino Médio</Typography>
          </Box>
          <Box component="span" sx={{ bgcolor: tokens.lime, border, borderRadius: 999, px: 1.5, py: 0.75, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>Nível {view.nivel}</Box>
        </Box>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>Sua ficha BNCC</Typography>
          <Typography sx={{ mt: 1, color: tokens.muted }}>
            Montada a partir do boletim e das suas missões. Mostra de onde você parte, nunca limita pra onde você vai.
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}> Seu professor vê essa mesma ficha pra planejar as aulas.</Box>
          </Typography>
        </Box>
        {resumo && (
          <SurfaceCard sx={{ gap: 0.75 }}>
            <Typography variant="overline" sx={{ color: tokens.muted }}>Resumo</Typography>
            <Typography>{resumo.resumo}</Typography>
          </SurfaceCard>
        )}
        <Box component="section" aria-labelledby="manda-bem" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography id="manda-bem" variant="h4" component="h2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleRoundedIcon sx={{ color: tokens.blue }} aria-hidden /> Você já manda bem
          </Typography>
          {dominadas.length === 0 && <Typography sx={{ color: tokens.muted }}>As missões vão trazer habilidades pra cá.</Typography>}
          {dominadas.map((s) => (
            <SurfaceCard key={s.code} sx={{ p: 2, gap: 0.5 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                <BnccChip code={s.code} tone="blue" />
                <Typography sx={{ fontSize: 13, color: tokens.muted }}>{s.skill?.areaLabel}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 600 }}>{s.skill?.descricaoJovem}</Typography>
            </SurfaceCard>
          ))}
        </Box>
        <Box component="section" aria-labelledby="destravar" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography id="destravar" variant="h4" component="h2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box component="span" aria-hidden sx={{ display: "inline-flex", bgcolor: tokens.lime, border, borderRadius: "8px", p: 0.25 }}><BoltRoundedIcon fontSize="small" /></Box> Bora destravar
          </Typography>
          {destravar.map((s) => (
            <SurfaceCard key={s.code} sx={{ p: 2, gap: 0.75 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                <BnccChip code={s.code} />
                <Typography sx={{ fontSize: 13, color: tokens.muted }}>{s.skill?.areaLabel}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 600 }}>{s.skill?.descricaoJovem}</Typography>
              <Box role="progressbar" aria-label={`${s.code}: ${s.rotulo}`} aria-valuenow={s.progresso} aria-valuemin={0} aria-valuemax={100}
                sx={{ height: 10, borderRadius: 999, bgcolor: tokens.track, overflow: "hidden" }}>
                <Box sx={{ width: `${s.progresso}%`, height: "100%", bgcolor: tokens.blue, borderRadius: 999, transformOrigin: "left center", animation: "g26-grow 700ms cubic-bezier(.2,.8,.2,1) 150ms backwards" }} />
              </Box>
              <Typography sx={{ fontSize: 13, color: tokens.muted }}>
                {s.rotulo}{abertas.has(s.code) ? " · missão aberta" : ""}
              </Typography>
            </SurfaceCard>
          ))}
        </Box>
        <Box><PillButton href="/aluno/missoes" arrow>Ver missões pra essas habilidades</PillButton></Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.5, md: 3 } }}>
        <LevelCard view={view} />
        <PointsTable />
        <MentorTiers view={view} />
      </Box>
    </Box>
  );
}
