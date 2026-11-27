"use client";
/* Tela 5 — Resultado do Da Galera. Perfil, frase e caminhos são do domínio; a IA só redige o texto da habilidade. */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useEffect, useRef } from "react";
import FlowHeader from "@/components/aluno/FlowHeader";
import { AffinityBar, BnccChip, InkCard, Overline, PillButton, SurfaceCard } from "@/components/ui";
import { useActions, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { useApi } from "@/lib/store/api";
import { getSkill } from "@/lib/store/seed";
import { EIXO_LABEL, NIVEL_HABILIDADE_LABEL } from "@/lib/config";
import { border, tokens } from "@/lib/theme";

interface GaleraTexto { porQueCombina: Record<string, string>; destravarTexto: string }
const CACHE = "galera:resultado";

export default function Resultado() {
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const { dispatch } = useActions();
  const callApi = useApi();
  const pedido = useRef(false);
  const r = view?.resultado;
  const cache = view?.local.iaCache[CACHE] as GaleraTexto | undefined;

  useEffect(() => {
    if (!view || !r || !r.destravar || cache || pedido.current || !view.perfil) return;
    pedido.current = true;
    const d = r.destravar;
    const body = {
      studentId: view.student.id,
      perfil: view.perfil,
      top4: r.caminhos.map((c) => ({ id: c.id, nome: c.nome, skills: c.skills })),
      destravar: { code: d.code, descricaoJovem: getSkill(d.code)?.descricaoJovem ?? d.code, status: d.status?.level ?? "defasagem" },
    };
    void callApi<GaleraTexto>("/api/galera", body, () => ({ porQueCombina: {}, destravarTexto: "" })).then(({ data }) => {
      if (data.destravarTexto) dispatch({ type: "cacheAI", studentId: view.student.id, key: CACHE, value: data });
    });
  }, [view, r, cache, callApi, dispatch]);

  if (!view) return null;

  if (!view.galera.concluido || !r) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 640 }}>
        <Typography variant="h1">Seu resultado sai no fim do Da Galera.</Typography>
        <Typography sx={{ color: tokens.muted }}>Faltam {view.galera.faltam} cenários. É rapidinho e não tem resposta certa.</Typography>
        <Box><PillButton href="/aluno/galera" arrow>Continuar o Da Galera</PillButton></Box>
      </Box>
    );
  }

  const d = r.destravar;
  const skill = d && getSkill(d.code);
  return (
    <Box sx={{ mx: { xs: -2.5, md: 0 }, mt: { xs: -1, md: 0 } }}>
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <FlowHeader icon="back" label="Voltar pro início" direita={
          <Box component="span" sx={{ bgcolor: tokens.lime, border, borderRadius: 999, px: 1.5, py: 0.5, fontSize: 13, whiteSpace: "nowrap" }}>+50 pts por terminar</Box>
        } />
      </Box>
      <Box sx={{ px: { xs: 2.5, md: 0 }, pb: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.2fr) minmax(0, 1fr)" }, gap: { xs: 2, md: 4 }, alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Overline>Da Galera · seu resultado</Overline>
          <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 48 } }}>{r.frase}</Typography>
          <SurfaceCard component="section" aria-label="Suas afinidades">
            {r.top4Eixos.map((t) => <AffinityBar key={t.eixo} label={EIXO_LABEL[t.eixo]} value={t.valor} rotulo={t.rotulo} />)}
          </SurfaceCard>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box component="section" aria-labelledby="caminhos" sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Typography id="caminhos" variant="h4" component="h2">Caminhos que combinam</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {r.caminhos.map((c) => (
                <Box key={c.id} component={NextLink} href={`/aluno/carreiras/${c.id}`} title={cache?.porQueCombina[c.id]}
                  sx={{ border, borderRadius: 999, px: 2, py: 1, fontWeight: 600, fontSize: 14, textDecoration: "none", color: tokens.ink, bgcolor: tokens.surface, minHeight: 44, display: "inline-flex", alignItems: "center" }}>
                  {c.nome}
                </Box>
              ))}
            </Box>
          </Box>
          {d && (
            <InkCard component="section" aria-labelledby="destravar">
              <Typography id="destravar" variant="overline" sx={{ color: tokens.mutedOnInk }}>Habilidade pra destravar</Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                <BnccChip code={d.code} />
                {d.status && <Typography sx={{ fontSize: 13, color: tokens.mutedOnInk }}>{NIVEL_HABILIDADE_LABEL[d.status.level]}</Typography>}
              </Box>
              <Typography sx={{ minHeight: 48 }}>
                {cache?.destravarTexto ?? `Pra chegar lá, destrava ${skill?.descricaoJovem.toLowerCase() ?? d.code}${d.frase ? `: ${d.frase}` : "."}`}
              </Typography>
            </InkCard>
          )}
          <Typography sx={{ fontSize: 14, color: tokens.muted }}>
            Seu boletim mostra de onde você parte, não até onde você vai. Esses caminhos mudam conforme você explora.
          </Typography>
          <PillButton href="/aluno/carreiras" size="large" arrow>Ver carreiras</PillButton>
        </Box>
      </Box>
    </Box>
  );
}
