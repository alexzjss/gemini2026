"use client";

import { Box, Button, Typography } from "@mui/material";
import Stack from "./Stack";
import Link from "next/link";
import { forwardRef, useState } from "react";
import ConversationDialog from "./ConversationDialog";
import { Cartao, ChipStatusAtencao, TituloSecao, formatarData } from "./comum";
import { cores } from "./cores";
import { useAcoesProfessor } from "./dados/fonte";
import type { AlunoTurma } from "./tipos";

/**
 * "Vale uma conversa" (docs/07 §7, docs/10 §14). Só o professor vê.
 * Sem número de risco, sem vermelho de fundo: motivo em texto e uma ação.
 */
const AttentionList = forwardRef<HTMLElement, { classId: string; alunos: AlunoTurma[] }>(function AttentionList(
  { classId, alunos },
  ref,
) {
  const { registrarConversa } = useAcoesProfessor();
  const [conversando, setConversando] = useState<AlunoTurma | null>(null);
  const lista = alunos
    .filter((a) => a.atencao.status !== "ok")
    .sort((x, y) => (x.atencao.status === y.atencao.status ? 0 : x.atencao.status === "atencao" ? -1 : 1));

  return (
    <Box component="section" ref={ref} aria-labelledby="titulo-atencao" tabIndex={-1} sx={{ scrollMarginTop: 80, outline: "none" }}>
      <Stack gap={1.5}>
        <Stack gap={0.5}>
          <TituloSecao id="titulo-atencao">Vale uma conversa</TituloSecao>
          <Typography sx={{ fontSize: 14, color: cores.muted }}>
            Sinais simples de frequência, acesso e notas. Servem para puxar conversa, nunca para rotular. O aluno não vê
            esta lista e ela não vai para a IA.
          </Typography>
        </Stack>

        {lista.length === 0 ? (
          <Cartao>
            <Typography sx={{ fontSize: 14 }}>Nenhum sinal na turma agora.</Typography>
          </Cartao>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {lista.map((a) => (
              <Cartao key={a.id} component="article" aria-label={`${a.nome}: ${a.atencao.status === "atencao" ? "vale uma conversa" : "acompanhando"}`}>
                <Stack gap={1.25} sx={{ height: "100%" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Box
                      component={Link}
                      href={`/professor/turma/${classId}/aluno/${a.id}`}
                      sx={{ fontWeight: 700, fontSize: 16, color: cores.ink, textDecorationThickness: 2, textUnderlineOffset: 3 }}
                    >
                      {a.nome}
                    </Box>
                    <ChipStatusAtencao status={a.atencao.status} />
                  </Stack>
                  <Stack component="ul" sx={{ m: 0, pl: 2.5, fontSize: 14, lineHeight: 1.45 }} gap={0.25}>
                    {a.atencao.motivos.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </Stack>
                  {a.atencao.conversa && (
                    <Typography sx={{ fontSize: 13, color: cores.muted, borderLeft: `3px solid ${cores.blue}`, pl: 1.25 }}>
                      Conversou em {formatarData(a.atencao.conversa.conversouEm)}
                      {a.atencao.conversa.nota ? `: “${a.atencao.conversa.nota}”` : "."}
                    </Typography>
                  )}
                  <Box sx={{ mt: "auto", pt: 0.5 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setConversando(a)}
                      sx={{
                        minHeight: 40,
                        borderRadius: 999,
                        border: `2px solid ${cores.ink}`,
                        color: cores.ink,
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { border: `2px solid ${cores.ink}`, bgcolor: cores.lime },
                      }}
                    >
                      {a.atencao.status === "acompanhando" ? "Registrar nova conversa" : "Conversei"}
                    </Button>
                  </Box>
                </Stack>
              </Cartao>
            ))}
          </Box>
        )}
      </Stack>

      <ConversationDialog
        aberto={Boolean(conversando)}
        nome={conversando?.nome ?? ""}
        motivos={conversando?.atencao.motivos ?? []}
        onFechar={() => setConversando(null)}
        onConfirmar={(nota) => {
          if (conversando) registrarConversa(conversando.id, nota);
          setConversando(null);
        }}
      />
    </Box>
  );
});

export default AttentionList;
