"use client";

import { Alert, Box, Button, Chip, CircularProgress, Popover, TextField, Typography } from "@mui/material";
import Stack from "./Stack";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ErroPlano, gerarPlano } from "./api";
import { BnccChip, Overline } from "./comum";
import { cores } from "./cores";
import { useAcoesProfessor } from "./dados/fonte";
import type { InteresseTurma, LinhaHeatmap } from "./tipos";

interface Props {
  classId: string;
  nAlunos: number;
  linha: LinhaHeatmap | null;
  ancora: HTMLElement | null;
  interesses: InteresseTurma[];
  onFechar: () => void;
}

/**
 * "Gerar plano" (docs/10 §14): interesse nº 1 da turma pré-selecionado,
 * observações opcionais, e o que vai para a IA explicado em uma linha.
 */
export default function GerarPlanoPopover({ classId, nAlunos, linha, ancora, interesses, onFechar }: Props) {
  const router = useRouter();
  const { salvarPlano } = useAcoesProfessor();
  const [interesse, setInteresse] = useState("");
  const [notas, setNotas] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const abortar = useRef<AbortController | null>(null);

  useEffect(() => {
    if (linha) {
      setInteresse(interesses[0]?.tag ?? "");
      setNotas("");
      setErro(null);
    }
  }, [linha, interesses]);

  useEffect(() => () => abortar.current?.abort(), []);

  async function gerar() {
    if (!linha || !interesse || carregando) return;
    setCarregando(true);
    setErro(null);
    abortar.current = new AbortController();
    try {
      const plano = await gerarPlano(
        {
          classId,
          skillCode: linha.skill.code,
          interesse,
          distribuicao: linha.distribuicao,
          nAlunos,
          notasProfessor: notas,
        },
        abortar.current.signal,
      );
      salvarPlano(plano);
      router.push(`/professor/plano/${plano.id}`);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setErro(e instanceof ErroPlano ? e.message : "Algo deu errado ao gerar o plano. Tenta de novo.");
      setCarregando(false);
    }
  }

  function fechar() {
    abortar.current?.abort();
    setCarregando(false);
    onFechar();
  }

  return (
    <Popover
      open={Boolean(linha && ancora)}
      anchorEl={ancora}
      onClose={fechar}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: { border: `2px solid ${cores.ink}`, borderRadius: "20px", boxShadow: `4px 4px 0 ${cores.ink}`, p: 2.5, width: 360, maxWidth: "calc(100vw - 32px)" },
          role: "dialog",
          "aria-labelledby": "titulo-gerar-plano",
        } as object,
      }}
    >
      {linha && (
        <Stack gap={2}>
          <Stack gap={0.75}>
            <Overline id="titulo-gerar-plano">Gerar plano de aula · 50 min</Overline>
            <Stack direction="row" alignItems="center" gap={1}>
              <BnccChip code={linha.skill.code} />
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{linha.pctDefasagem}% em defasagem</Typography>
            </Stack>
            <Typography sx={{ fontSize: 13, color: cores.muted }}>{linha.skill.descricaoJovem}</Typography>
          </Stack>

          <Box role="radiogroup" aria-label="Interesse da turma para contextualizar a aula">
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Contexto da aula</Typography>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {interesses.map((i, idx) => {
                const ativo = interesse === i.tag;
                return (
                  <Chip
                    key={i.tag}
                    role="radio"
                    aria-checked={ativo}
                    label={idx === 0 ? `${i.tag} · nº 1` : i.tag}
                    onClick={() => setInteresse(i.tag)}
                    disabled={carregando}
                    sx={{
                      fontWeight: 600,
                      border: `2px solid ${cores.ink}`,
                      bgcolor: ativo ? cores.lime : cores.surface,
                      color: cores.ink,
                      "&:hover": { bgcolor: ativo ? cores.lime : cores.paper },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          <TextField
            label="Observações (opcional)"
            placeholder="Ex.: turma gosta de trabalhar em dupla; só tenho o projetor."
            multiline
            minRows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value.slice(0, 500))}
            disabled={carregando}
            helperText="Não escreva nomes de alunos. A IA recebe só o código BNCC, o interesse e os percentuais da turma."
            size="small"
          />

          {erro && (
            <Alert severity="warning" variant="outlined" sx={{ borderColor: cores.ink, color: cores.ink }}>
              {erro}
            </Alert>
          )}

          <Stack direction="row" justifyContent="flex-end" gap={1}>
            <Button onClick={fechar} sx={{ color: cores.ink, fontWeight: 700, textTransform: "none" }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={gerar}
              disabled={!interesse}
              aria-busy={carregando}
              sx={{
                minHeight: 44,
                px: 2.5,
                borderRadius: 999,
                fontWeight: 700,
                textTransform: "none",
                bgcolor: cores.blue,
                border: `2px solid ${cores.ink}`,
                boxShadow: `3px 3px 0 ${cores.ink}`,
                "&:hover": { bgcolor: cores.blue },
              }}
            >
              {carregando ? (
                <Stack direction="row" alignItems="center" gap={1}>
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                  Consultando BNCC e Referencial…
                </Stack>
              ) : erro ? (
                "Tentar de novo"
              ) : (
                "Gerar"
              )}
            </Button>
          </Stack>
          <span role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
            {carregando ? "Consultando BNCC e Referencial de IA na Educação" : ""}
          </span>
        </Stack>
      )}
    </Popover>
  );
}
