"use client";

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Stack from "./Stack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AttentionList from "./AttentionList";
import DefasagemBars from "./DefasagemBars";
import GerarPlanoPopover from "./GerarPlanoPopover";
import SkillHeatmap from "./SkillHeatmap";
import SummaryCards from "./SummaryCards";
import { Cartao, CarregandoTela, LegendaNiveis, TituloPagina, TituloSecao } from "./comum";
import { cores } from "./cores";
import { useHidratado, useTurmaView } from "./dados/fonte";
import type { LinhaHeatmap } from "./tipos";

/** Mapa da turma — docs/10 §14. */
export default function TurmaMapa({ classId }: { classId: string }) {
  const hidratado = useHidratado();
  const view = useTurmaView(classId);
  const router = useRouter();
  const mobile = useMediaQuery("(max-width:899.95px)", { noSsr: true });
  const [aba, setAba] = useState<"mapa" | "resumo">("mapa");
  const [gerar, setGerar] = useState<{ linha: LinhaHeatmap; ancora: HTMLElement } | null>(null);
  const atencaoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hidratado) setAba(mobile ? "resumo" : "mapa");
  }, [hidratado, mobile]);

  if (!hidratado) return <CarregandoTela />;

  if (!view) {
    return (
      <Stack gap={2}>
        <TituloPagina>Turma não encontrada</TituloPagina>
        <Typography>
          Essa turma não está na sua lista. <Link href="/professor/turma/2A">Voltar para o 2º EM A</Link>.
        </Typography>
      </Stack>
    );
  }

  const { turma, turmas, professor, alunos, linhas, topInteresses, matches } = view;

  return (
    <Stack gap={{ xs: 3, md: 3.5 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "flex-end" }} gap={2}>
        <Stack gap={1}>
          <TituloPagina>{turma.nome}</TituloPagina>
          <Typography sx={{ color: cores.muted, fontSize: 15 }}>
            {alunos.length} alunos · {professor.nome}
          </Typography>
        </Stack>
        <FormControl size="small" sx={{ minWidth: 180, bgcolor: cores.surface }}>
          <InputLabel id="rotulo-turma">Turma</InputLabel>
          <Select
            labelId="rotulo-turma"
            label="Turma"
            value={turma.id}
            onChange={(e) => router.push(`/professor/turma/${e.target.value}`)}
          >
            {turmas.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <SummaryCards
        view={view}
        onVerAtencao={() => {
          atencaoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          atencaoRef.current?.focus({ preventScroll: true });
        }}
      />

      <Box component="section" aria-labelledby="titulo-mapa">
        <Stack gap={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={1.5}>
            <Stack gap={0.5}>
              <TituloSecao id="titulo-mapa">Habilidades BNCC × alunos</TituloSecao>
              <Typography sx={{ fontSize: 14, color: cores.muted }}>
                Do boletim e das missões. Clique num aluno para abrir a ficha; “Gerar plano” já vem com o interesse nº 1 da turma.
              </Typography>
            </Stack>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={aba}
              onChange={(_, v) => v && setAba(v)}
              aria-label="Visualização"
              sx={{ "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, px: 2, border: `2px solid ${cores.ink}`, color: cores.ink }, "& .Mui-selected": { bgcolor: `${cores.lime} !important` } }}
            >
              <ToggleButton value="mapa">Mapa</ToggleButton>
              <ToggleButton value="resumo">Resumo</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {aba === "mapa" ? (
            <>
              <LegendaNiveis />
              <SkillHeatmap
                classId={turma.id}
                alunos={alunos}
                linhas={linhas}
                onGerarPlano={(linha, ancora) => setGerar({ linha, ancora })}
              />
            </>
          ) : (
            <DefasagemBars linhas={linhas} />
          )}
        </Stack>
      </Box>

      <AttentionList ref={atencaoRef} classId={turma.id} alunos={alunos} />

      <Box component="section" aria-labelledby="titulo-matches">
        <Stack gap={1.5}>
          <TituloSecao id="titulo-matches">Match Day</TituloSecao>
          <Cartao>
            {matches.length === 0 ? (
              <Typography sx={{ fontSize: 14, color: cores.muted }}>
                Ninguém da turma deu match ainda. Os matches aparecem aqui depois do Match Day, no fim do semestre.
              </Typography>
            ) : (
              <Stack component="ul" sx={{ m: 0, p: 0, listStyle: "none" }} gap={1}>
                {matches.map((m) => (
                  <Typography component="li" key={m.studentId} sx={{ fontSize: 14 }}>
                    <strong>{m.nome}</strong> → {m.area}
                  </Typography>
                ))}
              </Stack>
            )}
          </Cartao>
        </Stack>
      </Box>

      <GerarPlanoPopover
        classId={turma.id}
        nAlunos={alunos.length}
        linha={gerar?.linha ?? null}
        ancora={gerar?.ancora ?? null}
        interesses={topInteresses}
        onFechar={() => setGerar(null)}
      />
    </Stack>
  );
}
