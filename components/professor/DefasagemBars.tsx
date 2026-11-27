"use client";

import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import type { LinhaHeatmap } from "./tipos";
import { Cartao, Overline } from "./comum";
import { cores } from "./cores";

/**
 * Top 6 habilidades por % de defasagem (docs/10 §14, aba "Resumo").
 * Série única → uma cor só, sem legenda; o valor vai escrito no tooltip e na
 * tabela equivalente logo abaixo (para leitor de tela e impressão).
 */
export default function DefasagemBars({ linhas }: { linhas: LinhaHeatmap[] }) {
  const top = linhas.filter((l) => l.nComDado).slice(0, 6);
  if (!top.length) return null;

  return (
    <Cartao>
      <Overline id="titulo-defasagem">Defasagem por habilidade · top 6</Overline>
      <Box aria-hidden sx={{ mt: 1 }}>
        <BarChart
          height={44 * top.length + 48}
          layout="horizontal"
          margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
          yAxis={[{ scaleType: "band", data: top.map((l) => l.skill.code), width: 104, disableTicks: true }]}
          xAxis={[{ min: 0, max: 100, valueFormatter: (v: number) => `${v}%` }]}
          series={[
            {
              data: top.map((l) => l.pctDefasagem),
              color: cores.blue,
              label: "% da turma em defasagem",
              valueFormatter: (v: number | null) => (v == null ? "" : `${v}% da turma`),
            },
          ]}
          grid={{ vertical: true }}
          borderRadius={4}
          hideLegend
        />
      </Box>
      <Box
        component="table"
        aria-labelledby="titulo-defasagem"
        sx={{ width: "100%", borderCollapse: "collapse", fontSize: 13, mt: 1, "& td, & th": { py: 0.5, textAlign: "left" } }}
      >
        <thead>
          <tr>
            <th scope="col">Habilidade</th>
            <th scope="col">Em defasagem</th>
          </tr>
        </thead>
        <tbody>
          {top.map((l) => (
            <tr key={l.skill.code}>
              <th scope="row" style={{ fontWeight: 600 }}>
                {l.skill.code}
              </th>
              <td>
                <Typography component="span" sx={{ fontSize: 13 }}>
                  {l.pctDefasagem}% ({l.distribuicao.defasagem} de {l.nComDado})
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Cartao>
  );
}
