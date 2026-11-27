"use client";

import { Box, Chip, Typography } from "@mui/material";
import Stack from "./Stack";
import Link from "next/link";
import { useState } from "react";
import { BnccChip, CarregandoTela, Cartao, TituloPagina, formatarData } from "./comum";
import { cores, fonteDisplay } from "./cores";
import { useHidratado, usePlanos, useTurmas } from "./dados/fonte";

/** Planos — docs/10 §17. */
export default function PlanList() {
  const hidratado = useHidratado();
  const planos = usePlanos();
  const turmas = useTurmas();
  const [filtro, setFiltro] = useState<string>("todas");

  if (!hidratado) return <CarregandoTela />;

  const nomeTurma = (id: string) => turmas.find((t) => t.id === id)?.nome ?? id;
  const lista = planos
    .filter((p) => filtro === "todas" || p.classId === filtro)
    .sort((a, b) => (b.aprovadoEm ?? b.criadoEm).localeCompare(a.aprovadoEm ?? a.criadoEm));

  const opcoes = [{ id: "todas", nome: "Todas" }, ...turmas.map((t) => ({ id: t.id, nome: t.nome }))];

  return (
    <Stack gap={3}>
      <Stack gap={1}>
        <TituloPagina>Planos</TituloPagina>
        <Typography sx={{ color: cores.muted, fontSize: 15 }}>
          Rascunhos e planos aprovados. Aprovados ficam em modo leitura até você editar de novo.
        </Typography>
      </Stack>

      <Stack direction="row" gap={1} flexWrap="wrap" role="group" aria-label="Filtrar por turma">
        {opcoes.map((o) => {
          const ativo = filtro === o.id;
          return (
            <Chip
              key={o.id}
              label={o.nome}
              onClick={() => setFiltro(o.id)}
              aria-pressed={ativo}
              sx={{ fontWeight: 700, border: `2px solid ${cores.ink}`, bgcolor: ativo ? cores.lime : cores.surface, color: cores.ink, "&:hover": { bgcolor: ativo ? cores.lime : cores.paper } }}
            />
          );
        })}
      </Stack>

      {lista.length === 0 ? (
        <Cartao>
          <Stack gap={1}>
            <Typography sx={{ fontWeight: 700 }}>Nenhum plano por aqui ainda.</Typography>
            <Typography sx={{ fontSize: 14, color: cores.muted }}>
              No mapa da turma, use “Gerar plano” numa habilidade para criar o primeiro.{" "}
              <Link href="/professor/turma/2A">Abrir o 2º EM A</Link>
            </Typography>
          </Stack>
        </Cartao>
      ) : (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
          {lista.map((p) => {
            const aprovado = p.status === "aprovado";
            return (
              <li key={p.id}>
                <Box
                  component={Link}
                  href={`/professor/plano/${p.id}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                    height: "100%",
                    boxSizing: "border-box",
                    p: 2.5,
                    bgcolor: cores.surface,
                    border: `2px solid ${cores.ink}`,
                    borderRadius: "20px",
                    color: cores.ink,
                    textDecoration: "none",
                    transition: "transform 120ms ease-out, box-shadow 120ms ease-out",
                    "&:hover, &:focus-visible": { transform: "translate(-2px,-2px)", boxShadow: `4px 4px 0 ${cores.ink}` },
                    "&:focus-visible": { outline: `3px solid ${cores.blue}`, outlineOffset: 2 },
                    "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover, &:focus-visible": { transform: "none" } },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <BnccChip code={p.skillCode} />
                    <Box
                      component="span"
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        px: 1,
                        py: 0.25,
                        borderRadius: 999,
                        border: `1.5px solid ${cores.ink}`,
                        bgcolor: aprovado ? cores.blue : cores.surface,
                        color: aprovado ? cores.surface : cores.ink,
                      }}
                    >
                      {aprovado ? "Aprovado" : "Rascunho"}
                    </Box>
                  </Stack>
                  <Typography component="h2" sx={{ fontFamily: fonteDisplay, fontWeight: 800, fontSize: 20, lineHeight: 1.15 }}>
                    {p.titulo || "Plano sem título"}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: cores.muted, mt: "auto" }}>
                    {nomeTurma(p.classId)} · {p.interesse} · {aprovado && p.aprovadoEm ? `aprovado ${formatarData(p.aprovadoEm)}` : `criado ${formatarData(p.criadoEm)}`}
                  </Typography>
                </Box>
              </li>
            );
          })}
        </Box>
      )}
    </Stack>
  );
}
