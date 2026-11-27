"use client";

import { Box, Button, Chip, Typography } from "@mui/material";
import Stack from "./Stack";
import type { TurmaView } from "./tipos";
import { BnccChip, Cartao, Overline, PontoStatus } from "./comum";
import { cores, fonteDisplay } from "./cores";

const numero = { fontFamily: fonteDisplay, fontWeight: 800, fontSize: 32, lineHeight: 1 } as const;

export default function SummaryCards({ view, onVerAtencao }: { view: TurmaView; onVerAtencao: () => void }) {
  const { maiorDefasagem, nAtencao, pctGalera } = view.resumo;

  return (
    <Box
      component="section"
      aria-label="Resumo da turma"
      sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}
    >
      <Cartao>
        <Stack gap={1}>
          <Overline>Maior defasagem</Overline>
          {maiorDefasagem ? (
            <>
              <Stack direction="row" alignItems="baseline" gap={1} flexWrap="wrap">
                <BnccChip code={maiorDefasagem.skill.code} />
                <Typography sx={numero}>{maiorDefasagem.pctDefasagem}%</Typography>
                <Typography component="span" sx={{ color: cores.muted, fontSize: 14 }}>
                  da turma
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 14, lineHeight: 1.4 }}>{maiorDefasagem.skill.descricaoJovem}</Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: 14, color: cores.muted }}>Sem boletim lançado ainda.</Typography>
          )}
        </Stack>
      </Cartao>

      <Cartao>
        <Stack gap={1}>
          <Overline>Top interesses</Overline>
          {view.topInteresses.length ? (
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {view.topInteresses.slice(0, 3).map((i) => (
                <Chip key={i.tag} label={i.tag} variant="outlined" sx={{ borderColor: cores.ink, borderWidth: 2, fontWeight: 600 }} />
              ))}
            </Stack>
          ) : (
            <Typography sx={{ fontSize: 14, color: cores.muted }}>A turma ainda não fez o Da Galera.</Typography>
          )}
          <Typography sx={{ fontSize: 13, color: cores.muted }}>Das carreiras que a turma salvou e quer conhecer.</Typography>
        </Stack>
      </Cartao>

      <Cartao>
        <Stack gap={1} alignItems="flex-start">
          <Overline>Vale uma conversa</Overline>
          <Stack direction="row" alignItems="center" gap={1}>
            {nAtencao > 0 && <PontoStatus status="atencao" />}
            <Typography sx={numero}>{nAtencao}</Typography>
            <Typography component="span" sx={{ color: cores.muted, fontSize: 14 }}>
              {nAtencao === 1 ? "aluno" : "alunos"}
            </Typography>
          </Stack>
          <Button size="small" onClick={onVerAtencao} sx={{ px: 0, minHeight: 32, fontWeight: 700, color: cores.blue }}>
            Ver quem
          </Button>
        </Stack>
      </Cartao>

      <Cartao>
        <Stack gap={1}>
          <Overline>Da Galera</Overline>
          <Stack direction="row" alignItems="baseline" gap={1}>
            <Typography sx={numero}>{pctGalera}%</Typography>
            <Typography component="span" sx={{ color: cores.muted, fontSize: 14 }}>
              concluíram
            </Typography>
          </Stack>
          <Box
            role="progressbar"
            aria-label="Turma que concluiu o Da Galera"
            aria-valuenow={pctGalera}
            aria-valuemin={0}
            aria-valuemax={100}
            sx={{ height: 10, borderRadius: 999, bgcolor: cores.track, overflow: "hidden" }}
          >
            <Box sx={{ width: `${pctGalera}%`, height: "100%", bgcolor: cores.blue, borderRadius: 999 }} />
          </Box>
        </Stack>
      </Cartao>
    </Box>
  );
}
