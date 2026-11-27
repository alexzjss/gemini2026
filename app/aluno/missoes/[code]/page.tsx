"use client";
/* Tela 11 — Quiz da missão. Quiz gerado por /api/missao no interesse escolhido (cache diário);
 * 4 questões com explicação após cada uma; pontos e subida de nível pelo reducer (docs/07 §4). */
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FullscreenFlow } from "@/components/shell";
import FlowHeader from "@/components/aluno/FlowHeader";
import { ErrorState, InkCard, OptionCard, PillButton, SegmentedProgress } from "@/components/ui";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { useApi } from "@/lib/store/api";
import { getMission, getSkill } from "@/lib/store/seed";
import { INTERESSES_QUIZ, LIMITES, NIVEL_HABILIDADE_LABEL } from "@/lib/config";
import type { Quiz, SkillLevel } from "@/lib/types";
import { border, fonts, tokens } from "@/lib/theme";

const LETRAS = ["A", "B", "C", "D"] as const;
const hoje = () => new Date().toISOString().slice(0, 10);

export default function QuizMissao() {
  const { code } = useParams<{ code: string }>();
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { dispatch, now } = useActions();
  const callApi = useApi();
  const skill = getSkill(code);
  const mission = getMission(code);

  const [interesse, setInteresse] = useState<string>(() => view?.interesseQuiz ?? "futebol");
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [respondida, setRespondida] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);
  const [levelAntes] = useState<SkillLevel>(() => view?.skills.find((s) => s.code === code)?.level ?? "defasagem");
  const [pontosAntes] = useState(() => view?.pontos ?? 0);

  const cacheKey = `missao:${code}:${interesse}:${hoje()}`;
  const cached = studentId ? (view?.local.iaCache[cacheKey] as Quiz | undefined) : undefined;

  useEffect(() => {
    if (!skill || !view || !studentId) return;
    if (cached) { setQuiz(cached); return; }
    let vivo = true;
    setQuiz(null); setErro(false);
    void callApi<Quiz | null>("/api/missao", { skillCode: code, interesse, serie: view.student.serie }, () => null).then(({ data }) => {
      if (!vivo) return;
      if (data?.questoes?.length === 4) { setQuiz(data); dispatch({ type: "cacheAI", studentId, key: cacheKey, value: data }); }
      else setErro(true);
    });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, interesse, tentativa]);

  const q = quiz?.questoes[i];
  const total = quiz?.questoes.length ?? LIMITES.questoesPorQuiz;
  const levelDepois = useMemo(() => view?.skills.find((s) => s.code === code)?.level, [view, code]);

  if (!skill) return <ErrorState titulo="Essa missão não existe." href="/aluno/missoes" rotulo="Ver missões" />;
  if (!view || !studentId) return null;

  const responder = () => {
    if (escolha === null || !q) return;
    setRespondida(true);
    if (escolha === q.correta) setAcertos((a) => a + 1);
  };
  const proxima = () => {
    if (i + 1 < total) { setI(i + 1); setEscolha(null); setRespondida(false); return; }
    const final = acertos;
    dispatch({ type: "finishMission", studentId, skillCode: code, acertos: final, at: now() });
    setFim(true);
  };

  /* ---------- Resumo ---------- */
  if (fim) {
    const aprovada = acertos >= LIMITES.acertosParaAprovar;
    const ganhou = view.pontos - pontosAntes;
    const subiu = levelDepois && levelDepois !== levelAntes;
    return (
      <FullscreenFlow bg="paper">
        <FlowHeader />
        <Box sx={{ px: 2.5, pb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h1">{acertos} de {total}</Typography>
          {aprovada ? (
            <Typography variant="h3" component="p">Você destravou {skill.descricaoJovem.toLowerCase()} 🔓</Typography>
          ) : (
            <Typography variant="h3" component="p">Bora de novo amanhã — cada tentativa conta.</Typography>
          )}
          {subiu && (
            <Box sx={{ alignSelf: "flex-start", bgcolor: tokens.lime, border, borderRadius: 999, px: 2, py: 1, fontWeight: 700 }}>
              {NIVEL_HABILIDADE_LABEL[levelAntes]} → {NIVEL_HABILIDADE_LABEL[levelDepois!]}
            </Box>
          )}
          <InkCard>
            <Typography sx={{ color: tokens.mutedOnInk }}>Pontos desta missão</Typography>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 32, color: tokens.lime }}>+{ganhou} pts</Typography>
            <Typography sx={{ fontSize: 14, color: tokens.mutedOnInk }}>
              +30 por completar{aprovada ? " · +40 por evoluir" : ""}{subiu ? " · +40 porque a habilidade subiu de nível" : ""}
              {ganhou === 0 ? " · essa missão já tinha contado hoje" : ""}
            </Typography>
          </InkCard>
          <PillButton href="/aluno" size="large" arrow>Voltar pro início</PillButton>
          <PillButton href="/aluno/missoes" variant="outlined">Ver outras missões</PillButton>
        </Box>
      </FullscreenFlow>
    );
  }

  return (
    <FullscreenFlow bg="paper">
      <FlowHeader titulo={`Missão · ${code}`} label="Sair da missão" direita={<span aria-hidden>{i + 1}/{total}</span>} />
      <Box sx={{ px: 2.5, pt: 1 }}>
        <SegmentedProgress total={total} atual={i + 1} variant="onLight" label={`Questão ${i + 1} de ${total}`} />
      </Box>
      <Box sx={{ px: 2.5, pt: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="h3" component="h1">{quiz?.titulo ?? mission?.titulo ?? skill.descricaoJovem}</Typography>
        <Box>
          <Button variant="outlined" size="small" endIcon={<ExpandMoreRoundedIcon />} disabled={i > 0 || respondida}
            onClick={(e) => setMenu(e.currentTarget)} aria-label={`Tema da missão: ${interesse}. Trocar`} sx={{ boxShadow: "none" }}>
            {interesse}
          </Button>
          <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
            {INTERESSES_QUIZ.map((t) => (
              <MenuItem key={t} selected={t === interesse} onClick={() => { setMenu(null); if (t !== interesse) { setInteresse(t); setI(0); setEscolha(null); setAcertos(0); } }}>{t}</MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      <Box sx={{ flex: 1, px: 2.5, pt: 2.5, pb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {erro ? (
          <Box role="alert" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography sx={{ fontWeight: 600 }}>Não deu pra montar essa missão agora.</Typography>
            <Box><PillButton color="ink" onClick={() => setTentativa((t) => t + 1)}>Tentar de novo</PillButton></Box>
          </Box>
        ) : !q ? (
          <Box role="status" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Typography sx={{ fontWeight: 600 }}>Montando sua missão com {interesse}…</Typography>
            <Skeleton variant="rounded" height={64} />
            {[0, 1, 2, 3].map((k) => <Skeleton key={k} variant="rounded" height={72} />)}
          </Box>
        ) : (
          <>
            <Typography id={`q-${q.id}`} sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4 }}>{q.enunciado}</Typography>
            <Box role="radiogroup" aria-labelledby={`q-${q.id}`} sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {q.alternativas.map((alt, k) => {
                const state = !respondida
                  ? escolha === k ? "selected" : "idle"
                  : k === q.correta ? "correct" : k === escolha ? "wrong" : "disabled";
                return <OptionCard key={k} letra={LETRAS[k]} label={alt} state={state} tabIndex={0} onSelect={() => !respondida && setEscolha(k)} />;
              })}
            </Box>
            {respondida && (
              <InkCard role="status">
                <Typography sx={{ fontWeight: 700, color: tokens.lime }}>{escolha === q.correta ? "Isso aí!" : "Quase."} Por quê:</Typography>
                <Typography>{q.explicacao}</Typography>
              </InkCard>
            )}
            {!respondida ? (
              <Button size="large" color="ink" onClick={responder} disabled={escolha === null}>{escolha === null ? "Escolha uma opção" : "Responder"}</Button>
            ) : (
              <Button size="large" color="secondary" onClick={proxima}>{i + 1 < total ? "Próxima" : "Ver resultado"}</Button>
            )}
          </>
        )}
      </Box>
    </FullscreenFlow>
  );
}
