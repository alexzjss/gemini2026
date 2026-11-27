"use client";
/* Tela 7 — Carreiras (swipe). Arrastar > 120px: direita salva, esquerda passa. Botões e teclado equivalentes.
 * Nenhuma carreira some por nota: passadas só vão pro fim da fila. */
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BnccChip, Overline, PillButton, SurfaceCard } from "@/components/ui";
import { CareerTop } from "@/components/aluno/blocos";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView, type StudentView } from "@/lib/store/hooks";
import { getSkill } from "@/lib/store/seed";
import { LIMITES, NIVEL_HABILIDADE_LABEL } from "@/lib/config";
import { border, fonts, hardShadow, tokens } from "@/lib/theme";

type Item = StudentView["fila"][number];

function CareerCard({ item, pos, total }: { item: Item; pos: number; total: number }) {
  const { career, combina, ondeAEscola } = item;
  return (
    <Box sx={{ bgcolor: tokens.surface, border, borderRadius: "24px", overflow: "hidden", boxShadow: hardShadow }}>
      <CareerTop career={career} combina={combina}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>{pos} de {total} hoje</Typography>
      </CareerTop>
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.75 }}>
        <Overline sx={{ color: tokens.muted }}>Raio-x de um dia</Overline>
        {career.raioX.map((r) => (
          <Box key={r.t} sx={{ display: "flex", gap: 1.5 }}>
            <Typography sx={{ fontFamily: fonts.display, fontWeight: 800, minWidth: 42 }}>{r.t}</Typography>
            <Typography>{r.what}</Typography>
          </Box>
        ))}
        {ondeAEscola && (
          <Box sx={{ bgcolor: tokens.paper, borderRadius: "14px", p: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Overline sx={{ color: tokens.muted }}>Onde a escola aparece</Overline>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <BnccChip code={ondeAEscola.code} />
              <Typography sx={{ fontSize: 14 }}>{ondeAEscola.frase ?? getSkill(ondeAEscola.code)?.descricaoJovem}</Typography>
            </Box>
          </Box>
        )}
        <Box component={NextLink} href={`/aluno/carreiras/${career.id}/mentor-simulado`} sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontWeight: 700, color: tokens.blue, minHeight: 44 }}>
          <ChatRoundedIcon fontSize="small" /> Conversar com um mentor simulado
        </Box>
      </Box>
    </Box>
  );
}

export default function Carreiras() {
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { dispatch, now } = useActions();
  const router = useRouter();
  const reduce = useReducedMotion();
  // Fila congelada ao abrir a tela (o ranking muda com salvas/passadas e a carta não pode "pular").
  const [fila] = useState<Item[]>(() => view?.fila ?? []);
  const [i, setI] = useState(0);
  const [verMais, setVerMais] = useState(false);
  const x = useMotionValue(0);
  const rot = useTransform(x, [-200, 200], [-8, 8]);

  const limite = verMais ? fila.length : Math.min(LIMITES.swipePorDia, fila.length);
  const atual = i < limite ? fila[i] : undefined;
  const proxima = i + 1 < limite ? fila[i + 1] : undefined;

  const agir = (kind: "pass" | "save" | "want") => {
    if (!atual || !studentId) return;
    dispatch({ type: "swipe", studentId, careerId: atual.career.id, kind, at: now() });
    x.set(0);
    if (kind === "want") { router.push(`/aluno/carreiras/${atual.career.id}`); return; }
    setI((n) => n + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,[role=combobox]")) return;
      if (e.key === "ArrowLeft") agir("pass");
      else if (e.key === "ArrowRight") agir("save");
      else if (e.key === "Enter" && (e.target as HTMLElement)?.tagName !== "A" && (e.target as HTMLElement)?.tagName !== "BUTTON") agir("want");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!view) return null;
  const salvas = view.swipe.salvas.length;
  const st = atual?.ondeAEscola?.status;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>Carreiras</Typography>
        <Box component="span" sx={{ border, borderRadius: 999, px: 1.5, py: 0.75, fontWeight: 700, fontSize: 14, bgcolor: tokens.surface }}>{salvas} salvas</Box>
      </Box>

      {atual ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 480px) minmax(0, 1fr)" }, gap: { xs: 2, md: 5 }, alignItems: "start" }}>
          <Box>
            <Box sx={{ position: "relative" }}>
              {proxima && (
                <Box aria-hidden sx={{ position: "absolute", inset: 0, transform: "rotate(3deg) translateY(8px)", opacity: 0.6, pointerEvents: "none", overflow: "hidden", borderRadius: "24px" }}>
                  <CareerCard item={proxima} pos={i + 2} total={limite} />
                </Box>
              )}
              <AnimatePresence mode="popLayout">
                <Box key={atual.career.id} component={motion.div} aria-live="polite"
                  drag={reduce ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.9}
                  style={{ x, rotate: rot }}
                  onDragEnd={(_, info) => { if (info.offset.x > 120) agir("save"); else if (info.offset.x < -120) agir("pass"); }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  sx={{ position: "relative", cursor: reduce ? "auto" : "grab", touchAction: "pan-y" }}>
                  <CareerCard item={atual} pos={i + 1} total={limite} />
                </Box>
              </AnimatePresence>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 3 }}>
              <IconButton aria-label={`Passar ${atual.career.nome}`} onClick={() => agir("pass")} sx={{ width: 56, height: 56, border, bgcolor: tokens.surface }}><CloseRoundedIcon /></IconButton>
              <IconButton aria-label={`Salvar ${atual.career.nome}`} onClick={() => agir("save")} sx={{ width: 56, height: 56, border, bgcolor: tokens.surface }}><BookmarkBorderRoundedIcon /></IconButton>
              <PillButton size="large" onClick={() => agir("want")}>Quero conhecer</PillButton>
            </Box>
            <Typography sx={{ textAlign: "center", fontSize: 13, color: tokens.muted, mt: 1.5 }}>Arraste ou use ← passar · → salvar · Enter quero conhecer</Typography>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 2 }}>
            {atual.ondeAEscola && (
              <SurfaceCard>
                <Overline sx={{ color: tokens.muted }}>Onde a escola aparece</Overline>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}><BnccChip code={atual.ondeAEscola.code} /><Typography sx={{ fontWeight: 600 }}>{getSkill(atual.ondeAEscola.code)?.descricaoJovem}</Typography></Box>
                <Typography>{atual.ondeAEscola.frase}</Typography>
                {st && <Typography sx={{ fontSize: 14, color: tokens.muted }}>Na sua ficha: {NIVEL_HABILIDADE_LABEL[st.level]}{st.subiuEm ? ", subiu esta semana" : ""}</Typography>}
              </SurfaceCard>
            )}
            <SurfaceCard>
              <Overline sx={{ color: tokens.muted }}>Como chegar</Overline>
              <Typography>{atual.career.comoChegar}</Typography>
            </SurfaceCard>
            <PillButton href={`/aluno/carreiras/${atual.career.id}`} variant="outlined" arrow>Ver detalhes e mentores reais</PillButton>
          </Box>
        </Box>
      ) : (
        <SurfaceCard sx={{ maxWidth: 640 }}>
          <Typography variant="h3" component="h2">Por hoje é isso!</Typography>
          <Typography sx={{ color: tokens.muted }}>Volta amanhã ou veja suas salvas.</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {view.swipe.salvas.map((id) => {
              const c = fila.find((f) => f.career.id === id)?.career;
              return c ? (
                <Box key={id} component={NextLink} href={`/aluno/carreiras/${id}`} sx={{ border, borderRadius: 999, px: 2, py: 1, fontWeight: 600, fontSize: 14, textDecoration: "none", color: tokens.ink, minHeight: 44, display: "inline-flex", alignItems: "center" }}>{c.nome}</Box>
              ) : null;
            })}
          </Box>
          {!verMais && fila.length > limite && <Box><PillButton variant="outlined" onClick={() => setVerMais(true)}>Ver mais carreiras</PillButton></Box>}
        </SurfaceCard>
      )}
    </Box>
  );
}
