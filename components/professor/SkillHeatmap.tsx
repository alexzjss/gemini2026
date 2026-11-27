"use client";

import { Box, Button, Tooltip, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AlunoTurma, LinhaHeatmap } from "./tipos";
import { BnccChip, ROTULO_NIVEL, estiloNivel } from "./comum";
import { cores } from "./cores";

const CELULA = 30;

const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

interface Props {
  classId: string;
  alunos: AlunoTurma[];
  linhas: LinhaHeatmap[];
  onGerarPlano: (linha: LinhaHeatmap, ancora: HTMLElement) => void;
}

/**
 * Heatmap habilidades (linhas) × alunos (colunas), docs/10 §14.
 * Tabela HTML de verdade: leitores de tela navegam por linha/coluna e cada
 * célula diz "{aluno}, {código}: {nível}".
 */
export default function SkillHeatmap({ classId, alunos, linhas, onGerarPlano }: Props) {
  const router = useRouter();
  const urlAluno = (id: string) => `/professor/turma/${classId}/aluno/${id}`;
  const [mostrarVazias, setMostrarVazias] = useState(false);
  const vazias = linhas.filter((l) => !l.nComDado).length;
  const visiveis = mostrarVazias ? linhas : linhas.filter((l) => l.nComDado);

  return (
    <>
    <Box
      sx={{
        overflowX: "auto",
        border: `2px solid ${cores.ink}`,
        borderRadius: "20px",
        bgcolor: cores.surface,
      }}
    >
      <Box
        component="table"
        sx={{
          borderCollapse: "separate",
          borderSpacing: 0,
          width: "100%",
          fontSize: 13,
          "& :where(th, td)": { p: 0, verticalAlign: "middle" },
        }}
      >
        <caption style={srOnly}>
          Mapa de habilidades da BNCC por aluno. Linhas ordenadas pela maior porcentagem de defasagem.
        </caption>
        <thead>
          <tr>
            <Box
              component="th"
              scope="col"
              sx={{
                textAlign: "left",
                px: 2,
                py: 1.5,
                position: "sticky",
                left: 0,
                zIndex: 2,
                bgcolor: cores.surface,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: cores.muted,
                borderBottom: `2px solid ${cores.ink}`,
                minWidth: 220,
              }}
            >
              Habilidade
            </Box>
            {alunos.map((a) => (
              <Box component="th" scope="col" key={a.id} sx={{ px: "2px", py: 1, borderBottom: `2px solid ${cores.ink}` }}>
                <Tooltip title={a.nome} arrow>
                  <Box
                    component={Link}
                    href={urlAluno(a.id)}
                    aria-label={`Abrir ficha de ${a.nome}`}
                    sx={{
                      width: CELULA,
                      height: CELULA,
                      mx: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      border: `2px solid ${cores.ink}`,
                      bgcolor: a.atencao.status === "atencao" ? cores.paper : cores.surface,
                      color: cores.ink,
                      fontWeight: 700,
                      textDecoration: "none",
                      position: "relative",
                      "&:hover": { bgcolor: cores.lime },
                      "&:focus-visible": { outline: `3px solid ${cores.blue}`, outlineOffset: 2 },
                    }}
                  >
                    {a.inicial}
                    {a.atencao.status !== "ok" && (
                      <Box
                        aria-hidden
                        sx={{
                          position: "absolute",
                          top: -3,
                          right: -3,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          border: `1.5px solid ${cores.surface}`,
                          bgcolor: a.atencao.status === "atencao" ? cores.danger : cores.blue,
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              </Box>
            ))}
            <Box
              component="th"
              scope="col"
              sx={{
                textAlign: "left",
                px: 2,
                py: 1.5,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: cores.muted,
                borderBottom: `2px solid ${cores.ink}`,
                borderLeft: `2px solid ${cores.track}`,
                minWidth: 230,
              }}
            >
              % defasagem
            </Box>
          </tr>
        </thead>
        <tbody>
          {visiveis.map((l, idx) => (
            <Box
              component="tr"
              key={l.skill.code}
              sx={{ "& > *": { borderBottom: idx === visiveis.length - 1 ? "none" : `1px solid ${cores.track}` } }}
            >
              <Box
                component="th"
                scope="row"
                sx={{ textAlign: "left", px: 2, py: 0.75, position: "sticky", left: 0, zIndex: 1, bgcolor: cores.surface, fontWeight: 400 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BnccChip code={l.skill.code} tom={l.pctDefasagem >= 50 ? "lime" : "ink"} />
                  <Typography
                    component="span"
                    title={l.skill.descricaoJovem}
                    sx={{ fontSize: 13, color: cores.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170 }}
                  >
                    {l.skill.descricaoJovem}
                  </Typography>
                </Box>
              </Box>
              {alunos.map((a) => {
                const nivel = a.skills[l.skill.code];
                const e = estiloNivel(nivel);
                const rotulo = nivel ? ROTULO_NIVEL[nivel] : "sem dado";
                return (
                  <Box component="td" key={a.id} sx={{ px: "2px", py: 0.5 }}>
                    <Box
                      title={`${a.nome} · ${l.skill.code}: ${rotulo}`}
                      onClick={() => router.push(urlAluno(a.id))}
                      sx={{
                        width: CELULA,
                        height: CELULA - 4,
                        mx: "auto",
                        borderRadius: "6px",
                        bgcolor: e.bg,
                        border: `1.5px solid ${e.borda}`,
                        cursor: "pointer",
                        transition: "transform 120ms ease-out",
                        "&:hover": { transform: "scale(1.12)" },
                        "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
                      }}
                    >
                      <span style={srOnly}>{`${a.nome}, ${l.skill.code}: ${rotulo}`}</span>
                    </Box>
                  </Box>
                );
              })}
              <Box component="td" sx={{ px: 2, py: 0.75, borderLeft: `2px solid ${cores.track}` }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box
                    aria-hidden
                    sx={{ flex: "0 0 56px", height: 8, borderRadius: 999, bgcolor: cores.track, overflow: "hidden" }}
                  >
                    <Box sx={{ width: `${l.pctDefasagem}%`, height: "100%", bgcolor: cores.ink, borderRadius: 999 }} />
                  </Box>
                  <Typography component="span" sx={{ fontWeight: 700, fontSize: 14, minWidth: 40, fontVariantNumeric: "tabular-nums" }}>
                    {l.nComDado ? `${l.pctDefasagem}%` : "—"}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!l.nComDado}
                    startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={(ev) => onGerarPlano(l, ev.currentTarget)}
                    aria-label={`Gerar plano para ${l.skill.code}`}
                    sx={{
                      ml: "auto",
                      minHeight: 32,
                      px: 1.5,
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      bgcolor: cores.blue,
                      color: cores.surface,
                      border: `2px solid ${cores.ink}`,
                      boxShadow: `2px 2px 0 ${cores.ink}`,
                      "&:hover": { bgcolor: cores.blue, boxShadow: `3px 3px 0 ${cores.ink}` },
                    }}
                  >
                    Gerar plano
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </tbody>
      </Box>
    </Box>
    {vazias > 0 && (
      <Button variant="text"
        onClick={() => setMostrarVazias((v) => !v)}
        aria-expanded={mostrarVazias}
        sx={{ alignSelf: "flex-start", color: cores.ink, fontWeight: 700, textTransform: "none", px: 0 }}
      >
        {mostrarVazias ? "Esconder" : "Mostrar"} {vazias} {vazias === 1 ? "habilidade" : "habilidades"} sem avaliação no boletim
      </Button>
    )}
    </>
  );
}
