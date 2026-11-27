"use client";
/* Tela 9 — Mentor simulado (F7.1 · Agente 1). Chat de texto com o "profissional" simulado por IA,
 * mini-desafio BNCC (+20, 1x por sessão). Nunca pede dado pessoal; sempre identificado como IA. */
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FullscreenFlow } from "@/components/shell";
import { BnccChip, ErrorState, Overline } from "@/components/ui";
import { useActions, useAppStore, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/selectors";
import { useApi } from "@/lib/store/api";
import { getCareer, getSkill, mentors } from "@/lib/store/seed";
import { LIMITES } from "@/lib/config";
import type { ChatTurn, MentorChatReply } from "@/lib/types";
import { fonts, tokens } from "@/lib/theme";
import ChatBubble from "./_components/ChatBubble";
import MiniChallengeChip from "./_components/MiniChallengeChip";
import TypingDots from "./_components/TypingDots";
import { ABERTURA_PADRAO, contemDadoPessoal, falaOffline } from "./_components/offline";

const SUGESTOES = ["Como é seu dia?", "Precisa ser bom em mat?", "Como eu começo?"];

interface SessionMeta { sessionId: string; desafioAberto?: { skillCode: string; enunciado: string }; resolvido: boolean; }

export default function MentorSimuladoPage() {
  const { id } = useParams<{ id: string }>();
  const career = getCareer(id);
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { state } = useAppStore();
  const { dispatch, now } = useActions();
  const callApi = useApi();

  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  const [digitando, setDigitando] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const metaKey = `mentor:${id}`;
  const chat: ChatTurn[] = useMemo(() => (studentId ? state.porAluno[studentId]?.chats[id] ?? [] : []), [state, studentId, id]);
  const storedMeta = studentId ? (state.porAluno[studentId]?.iaCache[metaKey] as SessionMeta | undefined) : undefined;
  const [meta, setMetaState] = useState<SessionMeta>(() => storedMeta ?? { sessionId: `${id}:${Date.now()}`, resolvido: false });
  const setMeta = (m: SessionMeta) => {
    setMetaState(m);
    if (studentId) dispatch({ type: "cacheAI", studentId, key: metaKey, value: m });
  };

  /* Habilidade ligada: 1ª da carreira que o aluno não domina (07 §3 "onde a escola aparece"). */
  const skillCode = useMemo(() => {
    if (!career) return "";
    const dom = new Set(view?.skills.filter((s) => s.level === "dominada").map((s) => s.code));
    return career.skills.find((c) => !dom.has(c)) ?? career.skills[0];
  }, [career, view?.skills]);

  /* Nível em que um(a) profissional de verdade abre (o próximo acima do atual). */
  const proximoMentor = useMemo(() => {
    if (!career || !view) return null;
    const daArea = mentors.filter((m) => m.careerIds.includes(career.id));
    const acima = daArea.filter((m) => m.nivelMinimo > view.nivel).sort((a, b) => a.nivelMinimo - b.nivelMinimo)[0];
    return { acima, temAberto: daArea.some((m) => m.nivelMinimo <= view.nivel) };
  }, [career, view]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length, digitando]);

  if (!career) return <ErrorState titulo="Não achamos essa carreira." texto="Ela pode ter mudado de nome. Bora ver as outras?" href="/aluno/carreiras" rotulo="Ver carreiras" />;
  if (!view || !studentId) return null;

  const turnosAluno = chat.filter((t) => t.role === "aluno").length;
  const acabou = turnosAluno >= LIMITES.chatMaxTurnos;
  const abertura = (ABERTURA_PADRAO[career.id] ?? ABERTURA_PADRAO.default).replace("{careerNome}", career.nome.toLowerCase());

  const enviar = async (msg: string) => {
    const limpo = msg.trim().slice(0, LIMITES.textoMaxChars);
    if (!limpo || digitando || acabou) return;
    if (contemDadoPessoal(limpo)) {
      setAviso("Aqui não precisa mandar contato, endereço nem rede social. Bora falar da profissão?");
      return;
    }
    setAviso("");
    setTexto("");
    const turnoAluno: ChatTurn = { role: "aluno", texto: limpo, at: now() };
    dispatch({ type: "chatTurn", studentId, careerId: career.id, turn: turnoAluno });
    const historico = [...chat, turnoAluno].slice(-LIMITES.chatMaxTurnos * 2);
    setDigitando(true);
    const body = { careerId: career.id, skillCode, serie: view.student.serie, historico, desafioAberto: meta.desafioAberto, desafioResolvido: meta.resolvido };
    const { data } = await callApi<MentorChatReply>("/api/mentor-simulado", body, () => falaOffline(body));
    setDigitando(false);
    dispatch({ type: "chatTurn", studentId, careerId: career.id, turn: { role: "mentor", texto: data.fala.slice(0, LIMITES.falaMentorMaxChars), at: now() } });

    if (meta.desafioAberto && data.desafioResolvido === true) {
      dispatch({ type: "awardMiniChallenge", studentId, sessionId: meta.sessionId, at: now() });
      setMeta({ ...meta, desafioAberto: undefined, resolvido: true });
    } else if (!meta.desafioAberto && !meta.resolvido && data.miniDesafio) {
      setMeta({ ...meta, desafioAberto: { skillCode, enunciado: data.miniDesafio.enunciado } });
    }
  };

  const novaConversa = () => {
    dispatch({ type: "resetChat", studentId, careerId: career.id });
    setMeta({ sessionId: `${career.id}:${Date.now()}`, resolvido: false });
    setAviso("");
  };

  const contexto = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, color: tokens.paper }}>
      <Box sx={{ border: `2px solid ${tokens.inkBorder}`, borderRadius: "20px", p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Overline sx={{ color: tokens.mutedOnInk }}>Raio-x de um dia</Overline>
        {career.raioX.map((r) => (
          <Box key={r.t} sx={{ display: "flex", gap: 1.5 }}>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, minWidth: 40, color: tokens.lime }}>{r.t}</Typography>
            <Typography>{r.what}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ border: `2px solid ${tokens.inkBorder}`, borderRadius: "20px", p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
        <Overline sx={{ color: tokens.mutedOnInk }}>Onde a escola aparece</Overline>
        <Box><BnccChip code={skillCode} /></Box>
        <Typography>{getSkill(skillCode)?.descricaoJovem}{career.escola[skillCode] ? ` — ${career.escola[skillCode]}` : ""}</Typography>
      </Box>
    </Box>
  );

  return (
    <FullscreenFlow bg="ink" maxWidth={640} aside={contexto}>
      <Box component="header" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 2.5 }}>
        <IconButton component={NextLink} href={`/aluno/carreiras/${career.id}`} aria-label="Voltar pra carreira" sx={{ bgcolor: tokens.inkRaised, color: tokens.paper, "&:hover": { bgcolor: tokens.inkBorder } }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {chat.length > 0 && (
            <IconButton onClick={novaConversa} aria-label="Começar nova conversa" sx={{ bgcolor: tokens.inkRaised, color: tokens.paper, "&:hover": { bgcolor: tokens.inkBorder } }}>
              <RestartAltRoundedIcon />
            </IconButton>
          )}
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: 13, fontWeight: 700, bgcolor: tokens.inkRaised, borderRadius: 999, px: 1.5, py: 1 }}>
            <Box component="span" aria-hidden sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: tokens.lime }} />
            Mentor simulado por IA
          </Box>
        </Box>
      </Box>

      <Box component="section" aria-label="Mentor" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, px: 2.5, pt: 2.75, textAlign: "center" }}>
        <Overline sx={{ color: tokens.mutedOnInk }}>Mentor simulado · IA</Overline>
        <Typography variant="h1" sx={{ fontSize: { xs: 28, md: 36 }, lineHeight: 1.05, color: tokens.paper }}>{career.nome}</Typography>
        <Box aria-hidden sx={{ mt: 1, width: 64, height: 64, borderRadius: "50%", bgcolor: tokens.inkRaised, border: `2px solid ${tokens.inkBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {digitando ? <TypingDots /> : <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, color: tokens.lime, fontSize: 20 }}>IA</Typography>}
        </Box>
      </Box>

      <Box ref={logRef} role="log" aria-live="polite" aria-label="Conversa com o mentor simulado"
        sx={{ flex: 1, minHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.25, px: 2.5, py: 2.5 }}>
        <ChatBubble role="mentor" texto={abertura} />
        {chat.map((t, i) => <ChatBubble key={`${t.at}-${i}`} role={t.role} texto={t.texto} />)}
        {digitando && (
          <Box sx={{ alignSelf: "flex-start", bgcolor: tokens.inkRaised, border: `2px solid ${tokens.inkBorder}`, borderRadius: "18px 18px 18px 4px", px: 2, py: 1.5 }}>
            <TypingDots label="O mentor simulado está escrevendo" />
          </Box>
        )}
        {meta.desafioAberto && <MiniChallengeChip code={meta.desafioAberto.skillCode} />}
        {meta.resolvido && <MiniChallengeChip code={skillCode} resolvido />}
        {acabou && (
          <Typography sx={{ alignSelf: "center", textAlign: "center", color: tokens.mutedOnInk, fontSize: 14, mt: 1 }}>
            Bora continuar no Match Day com alguém de verdade? <Link component={NextLink} href="/aluno" sx={{ color: tokens.lime }}>Ver meu Match Day</Link>
          </Typography>
        )}
      </Box>

      {chat.length === 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, px: 2.5, pb: 1.5 }} aria-label="Sugestões de pergunta">
          {SUGESTOES.map((s) => (
            <Box key={s} component="button" type="button" onClick={() => enviar(s)} disabled={digitando}
              sx={{ minHeight: 44, px: 2, borderRadius: 999, border: `2px solid ${tokens.inkBorder}`, bgcolor: "transparent", color: tokens.paper, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                "&:hover": { borderColor: tokens.lime }, "&:focus-visible": { outline: `3px solid ${tokens.lime}`, outlineOffset: 2 } }}>
              {s}
            </Box>
          ))}
        </Box>
      )}

      <Box component="form" onSubmit={(e) => { e.preventDefault(); void enviar(texto); }}
        sx={{ display: "flex", alignItems: "center", gap: 1, mx: 2.5, mb: 1.5, pl: 2, pr: 0.75, py: 0.75, borderRadius: 999, bgcolor: tokens.inkRaised, border: `2px solid ${tokens.inkBorder}`,
          "&:focus-within": { borderColor: tokens.lime } }}>
        <InputBase
          value={texto} onChange={(e) => setTexto(e.target.value.slice(0, LIMITES.textoMaxChars))}
          placeholder={acabou ? "Conversa encerrada" : meta.desafioAberto ? "Explica do seu jeito…" : "Pergunta o que quiser da profissão"}
          disabled={acabou} inputProps={{ "aria-label": "Sua mensagem", maxLength: LIMITES.textoMaxChars }}
          sx={{ flex: 1, color: tokens.paper, fontSize: 16, "& input::placeholder": { color: tokens.mutedOnInk, opacity: 1 } }}
        />
        <IconButton type="submit" aria-label="Enviar mensagem" disabled={!texto.trim() || digitando || acabou}
          sx={{ bgcolor: tokens.lime, color: tokens.ink, "&:hover": { bgcolor: tokens.lime }, "&.Mui-disabled": { bgcolor: tokens.inkBorder, color: tokens.mutedOnInk } }}>
          <ArrowUpwardRoundedIcon />
        </IconButton>
      </Box>
      {aviso && <Typography role="alert" sx={{ mx: 2.5, mb: 1.5, fontSize: 14, color: tokens.lime }}>{aviso}</Typography>}

      <Box component="footer" sx={{ mx: 2.5, mb: 3.5, border: `2px dashed ${tokens.inkBorder}`, borderRadius: "16px", px: 1.75, py: 1.5, display: "flex", gap: 1.25, alignItems: "center" }}>
        <LockRoundedIcon aria-hidden sx={{ color: tokens.mutedOnInk, fontSize: 22, flex: "none" }} />
        <Typography sx={{ fontSize: 13, lineHeight: 1.4, color: tokens.mutedOnInk }}>
          Isso é uma simulação por IA.{" "}
          {proximoMentor?.acima ? (
            <>Um(a) profissional de verdade abre no{" "}
              <Link component={NextLink} href="/aluno/missoes" sx={{ color: tokens.lime }}>nível {proximoMentor.acima.nivelMinimo}</Link>.</>
          ) : proximoMentor?.temAberto ? (
            <>Profissionais dessa área já estão abertos pra você no <Link component={NextLink} href="/aluno" sx={{ color: tokens.lime }}>Match Day</Link>.</>
          ) : (
            <>Profissionais de verdade aparecem no <Link component={NextLink} href="/aluno" sx={{ color: tokens.lime }}>Match Day</Link>.</>
          )}
        </Typography>
      </Box>
    </FullscreenFlow>
  );
}
