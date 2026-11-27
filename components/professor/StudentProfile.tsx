"use client";

import { Box, Button, Chip, Typography } from "@mui/material";
import Stack from "./Stack";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import SouthEastRoundedIcon from "@mui/icons-material/SouthEastRounded";
import Link from "next/link";
import { useState } from "react";
import type { AffinityAxis, NivelId, SkillStatus } from "@/lib/types";
import ConversationDialog from "./ConversationDialog";
import { BnccChip, Cartao, CarregandoTela, ChipStatusAtencao, Overline, ROTULO_NIVEL, TituloPagina, TituloSecao, estiloNivel, formatarData } from "./comum";
import { cores, fonteDisplay } from "./cores";
import { useAcoesProfessor, useFichaAluno, useHidratado } from "./dados/fonte";

/** Rótulos de docs/07 §2 e §5. Na integração podem vir de lib/config. */
const EIXOS: Record<AffinityAxis, string> = {
  analisar: "Organizar e analisar",
  tech: "Tecnologia e games",
  criar: "Criar e comunicar",
  cuidar: "Cuidar e ensinar",
  negocios: "Negócios e liderança",
  esportes: "Esportes, corpo e natureza",
};
const NIVEIS: Record<NivelId, string> = { 1: "Começando", 2: "Na Pista", 3: "Embalado", 4: "Destravado", 5: "Referência" };
const AREAS = ["Matemática", "Linguagens", "Natureza", "Humanas"] as const;

function Tendencia({ t }: { t: SkillStatus["tendencia"] }) {
  const Icone = t === "subindo" ? NorthEastRoundedIcon : t === "caindo" ? SouthEastRoundedIcon : EastRoundedIcon;
  const texto = t === "subindo" ? "subindo" : t === "caindo" ? "caindo" : "estável";
  return (
    <Stack direction="row" alignItems="center" gap={0.5} sx={{ fontSize: 13, color: cores.muted, minWidth: 82 }}>
      <Icone sx={{ fontSize: 16 }} aria-hidden />
      {texto}
    </Stack>
  );
}

function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <Stack gap={0.5}>
      <Overline>{rotulo}</Overline>
      <Typography sx={{ fontFamily: fonteDisplay, fontWeight: 800, fontSize: 26, lineHeight: 1 }}>{valor}</Typography>
      {detalhe && <Typography sx={{ fontSize: 13, color: cores.muted }}>{detalhe}</Typography>}
    </Stack>
  );
}

/** Ficha individual — docs/10 §15. */
export default function StudentProfile({ classId, studentId }: { classId: string; studentId: string }) {
  const hidratado = useHidratado();
  const ficha = useFichaAluno(studentId);
  const { registrarConversa } = useAcoesProfessor();
  const [conversando, setConversando] = useState(false);

  if (!hidratado) return <CarregandoTela />;
  if (!ficha || ficha.turma.id !== classId) {
    return (
      <Stack gap={2}>
        <TituloPagina>Aluno não encontrado</TituloPagina>
        <Typography>
          <Link href={`/professor/turma/${classId}`}>Voltar para a turma</Link>
        </Typography>
      </Stack>
    );
  }

  const { aluno, turma, frequenciaMedia, skills, perfil, carreiras, match, missoes } = ficha;
  const eixos = perfil ? (Object.entries(perfil) as [AffinityAxis, number][]).sort((a, b) => b[1] - a[1]) : [];

  return (
    <Stack gap={3}>
      <Box>
        <Button
          component={Link}
          href={`/professor/turma/${classId}`}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ color: cores.ink, fontWeight: 700, textTransform: "none", px: 0, mb: 1 }}
        >
          {turma.nome}
        </Button>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} alignItems={{ sm: "flex-end" }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              aria-hidden
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: cores.blue,
                color: cores.surface,
                border: `2px solid ${cores.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              {aluno.inicial}
            </Box>
            <Stack gap={0.5}>
              <TituloPagina>{aluno.nome}</TituloPagina>
              <Typography sx={{ color: cores.muted }}>
                {ficha.serie}º ano · Ensino Médio · {turma.nome}
              </Typography>
            </Stack>
          </Stack>
          <ChipStatusAtencao status={aluno.atencao.status} />
        </Stack>
      </Box>

      <Cartao>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 2.5 }}>
          <Indicador rotulo="Nível" valor={`${aluno.nivel} · ${NIVEIS[aluno.nivel]}`} />
          <Indicador rotulo="Pontos" valor={aluno.pontos.toLocaleString("pt-BR")} detalhe="Vêm de esforço, não de nota" />
          <Indicador rotulo="Frequência média" valor={`${frequenciaMedia}%`} detalhe="Semestre até agora" />
          <Indicador rotulo="Da Galera" valor={aluno.galeraConcluido ? "Feito" : "Em aberto"} />
        </Box>
      </Cartao>

      {aluno.atencao.status !== "ok" && (
        <Cartao sx={{ borderColor: cores.ink }}>
          <Stack gap={1.25}>
            <TituloSecao>Vale uma conversa</TituloSecao>
            <Stack component="ul" sx={{ m: 0, pl: 2.5, fontSize: 14 }} gap={0.25}>
              {aluno.atencao.motivos.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </Stack>
            {aluno.atencao.conversa && (
              <Typography sx={{ fontSize: 13, color: cores.muted, borderLeft: `3px solid ${cores.blue}`, pl: 1.25 }}>
                Conversou em {formatarData(aluno.atencao.conversa.conversouEm)}
                {aluno.atencao.conversa.nota ? `: “${aluno.atencao.conversa.nota}”` : "."}
              </Typography>
            )}
            <Box>
              <Button
                variant="outlined"
                onClick={() => setConversando(true)}
                sx={{ borderRadius: 999, border: `2px solid ${cores.ink}`, color: cores.ink, fontWeight: 700, textTransform: "none", "&:hover": { border: `2px solid ${cores.ink}`, bgcolor: cores.lime } }}
              >
                {aluno.atencao.status === "acompanhando" ? "Registrar nova conversa" : "Conversei"}
              </Button>
            </Box>
          </Stack>
        </Cartao>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" }, gap: 3, alignItems: "start" }}>
        <Box component="section" aria-labelledby="titulo-habilidades">
          <Stack gap={1.5}>
            <TituloSecao id="titulo-habilidades">Habilidades BNCC</TituloSecao>
            {AREAS.map((area) => {
              const daArea = skills.filter((s) => s.skill.areaLabel === area);
              if (!daArea.length) return null;
              return (
                <Cartao key={area} sx={{ p: { xs: 1.5, md: 2 } }}>
                  <Overline>{area}</Overline>
                  <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 1 }}>
                    {daArea.map((s) => {
                      const e = estiloNivel(s.level);
                      return (
                        <Stack component="li" key={s.code} direction="row" alignItems="center" gap={1.5} sx={{ py: 1, flexWrap: "wrap", "& + &": { borderTop: `1px solid ${cores.track}` } }}>
                          <BnccChip code={s.code} tom="ink" />
                          <Typography sx={{ fontSize: 14, flex: "1 1 160px", minWidth: 0 }}>{s.skill.descricaoJovem}</Typography>
                          <Box
                            component="span"
                            sx={{ fontSize: 12, fontWeight: 700, px: 1, py: 0.25, borderRadius: 999, bgcolor: e.bg, color: e.fg, border: `1.5px solid ${e.borda}`, whiteSpace: "nowrap" }}
                          >
                            {ROTULO_NIVEL[s.level]}
                          </Box>
                          <Typography sx={{ fontSize: 13, fontVariantNumeric: "tabular-nums", minWidth: 64 }}>média {s.media.toFixed(1).replace(".", ",")}</Typography>
                          <Tendencia t={s.tendencia} />
                        </Stack>
                      );
                    })}
                  </Stack>
                </Cartao>
              );
            })}
          </Stack>
        </Box>

        <Stack gap={3}>
          <Box component="section" aria-labelledby="titulo-afinidades">
            <Stack gap={1.5}>
              <TituloSecao id="titulo-afinidades">Afinidades (Da Galera)</TituloSecao>
              <Cartao>
                {eixos.length ? (
                  <Stack gap={1.25}>
                    {eixos.map(([eixo, v]) => (
                      <Stack key={eixo} gap={0.5}>
                        <Stack direction="row" justifyContent="space-between" sx={{ fontSize: 14 }}>
                          <span>{EIXOS[eixo]}</span>
                          <span style={{ color: cores.muted }}>{v >= 65 ? "forte" : v >= 35 ? "médio" : "leve"}</span>
                        </Stack>
                        <Box
                          role="progressbar"
                          aria-label={EIXOS[eixo]}
                          aria-valuenow={v}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          sx={{ height: 10, borderRadius: 999, bgcolor: cores.track, overflow: "hidden" }}
                        >
                          <Box sx={{ width: `${v}%`, height: "100%", borderRadius: 999, bgcolor: v >= 65 ? cores.blue : cores.blueSoft }} />
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: 14, color: cores.muted }}>Ainda não terminou o Da Galera.</Typography>
                )}
              </Cartao>
            </Stack>
          </Box>

          <Box component="section" aria-labelledby="titulo-carreiras">
            <Stack gap={1.5}>
              <TituloSecao id="titulo-carreiras">Carreiras de interesse</TituloSecao>
              <Cartao>
                {carreiras.length ? (
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {carreiras.map((c) => (
                      <Chip
                        key={c.nome}
                        label={c.tipo === "quero_conhecer" ? `${c.nome} · quer conhecer` : c.nome}
                        variant="outlined"
                        sx={{ border: `2px solid ${cores.ink}`, fontWeight: 600, bgcolor: c.tipo === "quero_conhecer" ? cores.lime : cores.surface }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: 14, color: cores.muted }}>Nenhuma carreira salva ainda.</Typography>
                )}
              </Cartao>
            </Stack>
          </Box>

          <Box component="section" aria-labelledby="titulo-match">
            <Stack gap={1.5}>
              <TituloSecao id="titulo-match">Match Day</TituloSecao>
              <Cartao>
                <Typography sx={{ fontSize: 14 }}>
                  {match
                    ? `Match com ${match.mentor} (${match.area})${match.agendadoPara ? ` · conversa em ${match.agendadoPara}` : ""}.`
                    : "Ainda sem match. Ele acontece no fim do semestre."}
                </Typography>
              </Cartao>
            </Stack>
          </Box>

          <Box component="section" aria-labelledby="titulo-missoes">
            <Stack gap={1.5}>
              <TituloSecao id="titulo-missoes">Missões</TituloSecao>
              <Cartao>
                {missoes.length ? (
                  <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 14, "& th, & td": { textAlign: "left", py: 0.75 } }}>
                    <thead>
                      <tr style={{ color: cores.muted, fontSize: 12 }}>
                        <th scope="col">Habilidade</th>
                        <th scope="col">Acertos</th>
                        <th scope="col">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missoes.map((m, i) => (
                        <tr key={`${m.skillCode}-${m.at}-${i}`}>
                          <td>
                            <BnccChip code={m.skillCode} tom="ink" />
                          </td>
                          <td style={{ fontVariantNumeric: "tabular-nums" }}>
                            {m.acertos} de {m.total}
                          </td>
                          <td>{formatarData(m.at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 14, color: cores.muted }}>Nenhuma missão feita ainda.</Typography>
                )}
              </Cartao>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Typography sx={{ fontSize: 14, color: cores.muted, borderTop: `2px solid ${cores.ink}`, pt: 2 }}>
        Use para conversar e planejar, nunca para rotular. Notas não definem nem bloqueiam carreiras.
      </Typography>

      <ConversationDialog
        aberto={conversando}
        nome={aluno.nome}
        motivos={aluno.atencao.motivos}
        onFechar={() => setConversando(false)}
        onConfirmar={(nota) => {
          registrarConversa(aluno.id, nota);
          setConversando(false);
        }}
      />
    </Stack>
  );
}
