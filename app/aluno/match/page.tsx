"use client";
/* Tela 13 — Match Day (F7.3/F7.4 · Agente 1).
 * Score determinístico (lib/domain/match, roda em /api/match); IA só redige porquê e perguntas.
 * Sequência: contagem 3‑2‑1 → card vira → confete. prefers-reduced-motion: só fade, sem confete. */
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import NextLink from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FullscreenFlow } from "@/components/shell";
import { Avatar, InkCard, Overline, PillButton, SurfaceCard } from "@/components/ui";
import { useActions, useAppStore, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView, type StudentView } from "@/lib/store/selectors";
import { useApi } from "@/lib/store/api";
import { getMentor, mentors } from "@/lib/store/seed";
import { elegivel, escolherMentor, horarios } from "@/lib/domain/match";
import { nivelDef, nivelPorPontos } from "@/lib/domain/niveis";
import { SEMESTRE } from "@/lib/config";
import type { MatchResult } from "@/lib/types";
import { border, fonts, hardShadow, tokens } from "@/lib/theme";
import FactorBars from "./_components/FactorBars";
import MatchDayCard from "./_components/MatchDayCard";
import ScheduleDialog from "./_components/ScheduleDialog";
import { dataMatchDay, diasParaMatchDay, matchDayChegou } from "./_components/datas";

type Fase = "carregando" | "contagem" | "revelado";

/** Fallback local se a rota não responder: mesmo algoritmo, texto neutro. */
function matchLocal(view: StudentView): MatchResult {
  const el = elegivel(view.snapshot);
  if (!el.eligible) return { eligible: false, faltaPara: el.faltaPara, source: "fallback" };
  const best = escolherMentor(view.snapshot, mentors);
  if (!best) return { eligible: false, faltaPara: ["Ainda não há vagas de mentor abertas neste semestre."], source: "fallback" };
  return {
    eligible: true, mentorId: best.mentor.id, score: best.score, fatores: best.fatores, source: "fallback",
    explicacao: "Vocês combinam no que você mais curte, e o que mais pesou foi seu esforço no semestre: missões, frequência e evolução.",
    perguntasSugeridas: ["Como é um dia normal no seu trabalho?", "Onde o que eu estudo na escola aparece na sua rotina?", "Por onde eu começo, ainda no Ensino Médio?"],
  };
}

function Header({ onBlue = false }: { onBlue?: boolean }) {
  return (
    <Box component="header" sx={{ display: "flex", justifyContent: "flex-end", px: 2.5, pt: 2.5 }}>
      <IconButton component={NextLink} href="/aluno" aria-label="Fechar o Match Day e voltar pro início"
        sx={{ border: onBlue ? 0 : border, bgcolor: onBlue ? tokens.onBlueSubtle : tokens.surface, color: onBlue ? tokens.white : tokens.ink }}>
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}

export default function MatchPage() {
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { state } = useAppStore();
  const { dispatch, now } = useActions();
  const precisaPresencas = Boolean(view && state.semestreSimulado && !view.local.eventos.some((e) => e.type === "presenca_semana"));
  /* Semestre já simulado por outro perfil: lança as presenças deste aluno também (idempotente). */
  useEffect(() => {
    if (precisaPresencas && view) dispatch({ type: "simulateSemester", studentId: view.student.id, at: now() });
  }, [precisaPresencas, view, dispatch, now]);
  if (!view || precisaPresencas) return null;
  const chegou = matchDayChegou(state.semestreSimulado);
  if (!chegou) return <AntesDoMatchDay view={view} />;
  if (!view.elegibilidade.eligible) return <QuaseLa view={view} />;
  return <Revelacao view={view} />;
}

/* ---------- Antes da data ---------- */
function AntesDoMatchDay({ view }: { view: StudentView }) {
  const dias = diasParaMatchDay();
  return (
    <FullscreenFlow bg="paper">
      <Header />
      <Box sx={{ px: 2.5, pb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <Overline>Match Day · {dataMatchDay()}</Overline>
        <Typography variant="h1">Faltam {dias} {dias === 1 ? "dia" : "dias"}.</Typography>
        <Typography sx={{ color: tokens.muted }}>No fim do {SEMESTRE.nome}, o algoritmo junta o que você curte com o seu esforço e te conecta com um(a) mentor(a) de verdade.</Typography>
        <MatchDayCard view={view} />
      </Box>
    </FullscreenFlow>
  );
}

/* ---------- Não elegível ---------- */
function QuaseLa({ view }: { view: StudentView }) {
  const s = view.snapshot;
  const faltamCenarios = Math.max(0, view.galera.total - view.galera.respondidos);
  const itens = [
    !s.galeraConcluido && {
      txt: faltamCenarios > 0 ? `Termina o Da Galera — ${faltamCenarios === 1 ? "falta 1 cenário" : `faltam ${faltamCenarios} cenários`}.` : "Termina o Da Galera — é só ver seu resultado.",
      href: "/aluno/galera", cta: "Continuar o Da Galera",
    },
    s.missoes < 1 && { txt: "Faz 1 missão BNCC — leva uns 8 minutos.", href: "/aluno/missoes", cta: "Ver missões" },
    s.frequenciaMedia < 60 && { txt: "Segura a frequência nas próximas semanas: cada semana em dia também vale +15 pts.", href: undefined, cta: undefined },
  ].filter(Boolean) as { txt: string; href?: string; cta?: string }[];

  return (
    <FullscreenFlow bg="paper">
      <Header />
      <Box sx={{ px: 2.5, pb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <Overline>Match Day</Overline>
        <Typography variant="h1">Quase lá!</Typography>
        <Typography sx={{ color: tokens.muted }}>Falta pouco pra destravar seu match. Nota não entra nessa conta: é o que você faz aqui que conta.</Typography>
        {itens.map((it) => (
          <SurfaceCard key={it.txt}>
            <Typography sx={{ fontWeight: 600 }}>{it.txt}</Typography>
            {it.href && <Box><PillButton href={it.href} color="ink" arrow>{it.cta}</PillButton></Box>}
          </SurfaceCard>
        ))}
      </Box>
    </FullscreenFlow>
  );
}

/* ---------- Revelação ---------- */
function Revelacao({ view }: { view: StudentView }) {
  const { dispatch } = useActions();
  const callApi = useApi();
  const reduce = useReducedMotion();
  /* Já tinha match ao abrir? Então mostra direto, sem contagem nem confete. */
  const [stored] = useState(() => Boolean(view.match?.eligible && view.match.mentorId));
  const [fase, setFase] = useState<Fase>(stored ? "revelado" : "carregando");
  const [contagem, setContagem] = useState(3);
  const [agendar, setAgendar] = useState(false);
  const pedido = useRef(false);

  /* Nível antes das presenças lançadas pelo "simular fim do semestre". */
  const subiu = useMemo(() => {
    const presencas = view.local.eventos.filter((e) => e.type === "presenca_semana").reduce((s, e) => s + e.pontos, 0);
    const antes = nivelPorPontos(view.pontos - presencas);
    return view.nivel > antes ? nivelDef(view.nivel) : null;
  }, [view.local.eventos, view.pontos, view.nivel]);

  useEffect(() => {
    if (stored || pedido.current) return;
    pedido.current = true;
    (async () => {
      const { data } = await callApi<MatchResult>("/api/match", { snapshot: view.snapshot }, () => matchLocal(view));
      dispatch({ type: "setMatch", studentId: view.student.id, match: data });
      setFase(reduce ? "revelado" : "contagem");
    })();
  }, [stored, callApi, dispatch, view, reduce]);

  useEffect(() => {
    if (fase !== "contagem") return;
    if (contagem === 0) { setFase("revelado"); return; }
    const t = window.setTimeout(() => setContagem((c) => c - 1), 700);
    return () => window.clearTimeout(t);
  }, [fase, contagem]);

  const match = view.match;
  const mentor = match?.mentorId ? getMentor(match.mentorId) : undefined;

  useEffect(() => {
    if (fase !== "revelado" || reduce || stored) return;
    let cancel = false;
    const t = window.setTimeout(async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancel) return;
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.35 }, colors: [tokens.blue, tokens.lime, tokens.ink], disableForReducedMotion: true });
    }, 450);
    return () => { cancel = true; window.clearTimeout(t); };
  }, [fase, reduce, stored]);

  if (match && !match.eligible) return <QuaseLa view={view} />;

  return (
    <Box sx={{ bgcolor: tokens.paper, minHeight: "calc(100dvh - var(--demobar-h, 0px))" }}>
      <Box component="section" aria-label="Revelação do match" sx={{ bgcolor: tokens.blue, color: tokens.white, pb: { xs: 5, md: 7 } }}>
        <Box sx={{ maxWidth: 640, mx: "auto" }}>
          <Header onBlue />
          <Box sx={{ px: 2.5, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5 }}>
            <Overline sx={{ color: tokens.blueTint }}>Match Day</Overline>
            <Typography variant="h1" component="h1" sx={{ color: tokens.white }}>Seu semestre valeu.</Typography>
            {subiu && (
              <Box component={motion.span} initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }} animate={reduce ? { opacity: 1 } : { scale: [0.6, 1.12, 1], opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{ display: "inline-flex", bgcolor: tokens.lime, color: tokens.ink, border, borderRadius: 999, px: 2, py: 1, fontWeight: 700, fontSize: 15 }}>
                Você chegou no nível {subiu.id} · {subiu.nome}!
              </Box>
            )}

            <Box aria-live="polite" sx={{ width: "100%", minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", mt: 2, perspective: "1000px" }}>
              <AnimatePresence mode="wait">
                {fase === "carregando" && (
                  <Box key="load" component={motion.div} exit={{ opacity: 0 }} role="status" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                    <Skeleton variant="rounded" width={280} height={220} sx={{ bgcolor: tokens.onBlueSubtle }} />
                    <Typography sx={{ color: tokens.blueTint, fontWeight: 600 }}>Cruzando o que você curte com o seu esforço…</Typography>
                  </Box>
                )}
                {fase === "contagem" && contagem > 0 && (
                  <Box key={`n${contagem}`} component={motion.span} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 0.3 }} aria-label={`${contagem}`}
                    sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 120, lineHeight: 1, color: tokens.lime }}>
                    {contagem}
                  </Box>
                )}
                {fase === "revelado" && mentor && (
                  <Box key="card" component={motion.div}
                    initial={reduce || stored ? { opacity: 0 } : { rotateY: 180, opacity: 0 }}
                    animate={reduce || stored ? { opacity: 1 } : { rotateY: 0, opacity: 1 }}
                    transition={{ duration: reduce || stored ? 0.3 : 0.6, ease: "easeOut" }}
                    sx={{ width: "100%", maxWidth: 420, bgcolor: tokens.surface, color: tokens.ink, border, borderRadius: "24px", boxShadow: hardShadow, p: 3,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 1.25, textAlign: "center", transformStyle: "preserve-3d" }}>
                    <Avatar inicial={mentor.inicial} size={72} tone="lime" />
                    <Overline sx={{ color: tokens.muted }}>Seu match</Overline>
                    <Typography variant="h2" component="h2">{mentor.cargo}</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{mentor.organizacao}</Typography>
                    <Typography sx={{ color: tokens.muted }}>{mentor.bio}</Typography>
                    <Typography sx={{ fontSize: 13, color: tokens.muted, border: `2px dashed ${tokens.ink}`, borderRadius: 999, px: 1.5, py: 0.5 }}>perfil ilustrativo</Typography>
                  </Box>
                )}
              </AnimatePresence>
            </Box>
          </Box>
        </Box>
      </Box>

      {fase === "revelado" && mentor && match && (
        <Box component={motion.div} initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: reduce || stored ? 0 : 0.4 }}
          sx={{ maxWidth: 640, mx: "auto", px: 2.5, py: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", gap: 2 }}>
          <SurfaceCard component="section" aria-labelledby="porque">
            <Typography id="porque" variant="h3" component="h2">Por que deu match</Typography>
            {match.fatores && <FactorBars fatores={match.fatores} />}
            {match.explicacao && <Typography sx={{ mt: 0.5 }}>{match.explicacao}</Typography>}
          </SurfaceCard>
          {match.perguntasSugeridas?.length ? (
            <InkCard component="section" aria-labelledby="perguntas">
              <Typography id="perguntas" variant="h3" component="h2" sx={{ color: tokens.paper }}>Leva essas perguntas</Typography>
              <Box component="ol" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1, "& li::marker": { color: tokens.lime, fontWeight: 800 } }}>
                {match.perguntasSugeridas.slice(0, 3).map((p) => <li key={p}><Typography>{p}</Typography></li>)}
              </Box>
            </InkCard>
          ) : null}
          <Typography sx={{ fontSize: 14, color: tokens.muted }}>Se você destravou um nível novo, ele vale pro próximo Match Day.</Typography>

          {match.agendadoPara ? (
            <Box role="status" sx={{ bgcolor: tokens.lime, border, borderRadius: "20px", boxShadow: hardShadow, p: 2.5, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <EventAvailableRoundedIcon aria-hidden />
              <Box>
                <Typography variant="h4" component="p">Combinado! {match.agendadoPara}.</Typography>
                <Typography>Você recebe o link pela escola.</Typography>
              </Box>
            </Box>
          ) : (
            <PillButton size="large" arrow onClick={() => setAgendar(true)}>Agendar conversa</PillButton>
          )}
          <PillButton variant="outlined" href="/aluno">Voltar pro início</PillButton>

          <ScheduleDialog
            open={agendar}
            horarios={horarios(mentor)}
            mentorLabel={`${mentor.cargo.toLowerCase()} (${mentor.organizacao.toLowerCase()})`}
            onClose={() => setAgendar(false)}
            onConfirm={(h) => { dispatch({ type: "scheduleMatch", studentId: view.student.id, quando: h }); setAgendar(false); }}
          />
        </Box>
      )}
    </Box>
  );
}
