"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import Stack from "./Stack";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LessonPlan, SkillLevel } from "@/lib/types";
import CitationsPanel from "./CitationsPanel";
import EthicsSeal from "./EthicsSeal";
import { ErroPlano, gerarPlano } from "./api";
import { BnccChip, Cartao, CarregandoTela, Overline, TituloPagina, TituloSecao } from "./comum";
import { cores, fonteDisplay } from "./cores";
import { useAcoesProfessor, useHidratado, usePlano, useTurmaView } from "./dados/fonte";

const DURACAO = 50;

const ROTULO_ADAPTACAO: Record<SkillLevel, string> = {
  defasagem: "Para quem está em defasagem",
  em_desenvolvimento: "Para quem está em desenvolvimento",
  dominada: "Para quem já domina",
};

type Etapa = LessonPlan["etapas"][number];

const campo = {
  "& .MuiOutlinedInput-root": { bgcolor: cores.surface, borderRadius: "14px" },
  "& .MuiOutlinedInput-notchedOutline": { borderWidth: 2, borderColor: cores.track },
  // Plano aprovado fica em leitura, mas com texto legível (sem o cinza do disabled).
  "& .MuiInputBase-input.Mui-disabled": { color: cores.ink, WebkitTextFillColor: cores.ink },
  "& .MuiInputLabel-root.Mui-disabled": { color: cores.muted },
} as const;

/** Editor de plano — docs/10 §16. Human-in-the-loop: a IA sugere, o professor decide. */
export default function PlanEditor({ planId }: { planId: string }) {
  const hidratado = useHidratado();
  const plano = usePlano(planId);
  const router = useRouter();
  const { salvarPlano, aprovarPlano, reabrirPlano } = useAcoesProfessor();
  const turmaView = useTurmaView(plano?.classId ?? "");

  const [rascunho, setRascunho] = useState<LessonPlan | null>(null);
  const [salvo, setSalvo] = useState(true);
  const [ativa, setAtiva] = useState<{ n: number; k: number } | null>(null);
  const [confirmarRegen, setConfirmarRegen] = useState(false);
  const [regenerando, setRegenerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tentouAprovar, setTentouAprovar] = useState(false);
  const [aviso, setAviso] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega o rascunho quando o plano chega (ou é trocado por um regenerado).
  const versaoCarregada = useRef<string | null>(null);
  useEffect(() => {
    if (!plano) return;
    const versao = `${plano.id}:${plano.criadoEm}:${plano.status}`;
    if (versaoCarregada.current === versao) return;
    versaoCarregada.current = versao;
    setRascunho(plano);
    setSalvo(true);
  }, [plano]);

  // Ao sair da página, grava a edição que ainda estava no debounce.
  const pendente = useRef<LessonPlan | null>(null);
  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
      if (pendente.current) salvarPlano(pendente.current);
    },
    [salvarPlano],
  );

  if (!hidratado || (plano && !rascunho)) return <CarregandoTela />;
  if (!plano || !rascunho) {
    return (
      <Stack gap={2}>
        <TituloPagina>Plano não encontrado</TituloPagina>
        <Typography>
          Ele pode ter sido criado em outro navegador. <Link href="/professor/planos">Ver planos</Link>
        </Typography>
      </Stack>
    );
  }

  const aprovado = rascunho.status === "aprovado";
  const turmaNome = turmaView?.turma.nome ?? rascunho.classId;
  const somaMinutos = rascunho.etapas.reduce((s, e) => s + (Number(e.minutos) || 0), 0);
  const objetivoOk = rascunho.objetivo.trim().length > 0;
  const etapasOk = rascunho.etapas.length > 0 && rascunho.etapas.some((e) => e.nome.trim() || e.descricao.trim());
  const podeAprovar = objetivoOk && etapasOk;

  function editar(muda: (p: LessonPlan) => LessonPlan) {
    if (!rascunho) return;
    const novo = muda(rascunho);
    setRascunho(novo);
    setSalvo(false);
    pendente.current = novo;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      salvarPlano(novo);
      pendente.current = null;
      setSalvo(true);
    }, 500);
  }

  const editarEtapa = (i: number, parcial: Partial<Etapa>) =>
    editar((p) => ({ ...p, etapas: p.etapas.map((e, j) => (j === i ? { ...e, ...parcial } : e)) }));

  function aprovar() {
    setTentouAprovar(true);
    if (!podeAprovar || !rascunho) return;
    if (temporizador.current) clearTimeout(temporizador.current);
    pendente.current = null;
    salvarPlano(rascunho);
    aprovarPlano(rascunho.id);
    setSalvo(true);
    setAviso(true);
  }

  async function regenerar() {
    setConfirmarRegen(false);
    if (!rascunho) return;
    const linha = turmaView?.linhas.find((l) => l.skill.code === rascunho.skillCode);
    setRegenerando(true);
    setErro(null);
    try {
      const novo = await gerarPlano({
        classId: rascunho.classId,
        skillCode: rascunho.skillCode,
        interesse: rascunho.interesse,
        distribuicao: linha?.distribuicao ?? { defasagem: 0, em_desenvolvimento: 0, dominada: 0 },
        nAlunos: turmaView?.alunos.length ?? 0,
      });
      pendente.current = null;
      if (temporizador.current) clearTimeout(temporizador.current);
      // Mantém o id para a URL continuar valendo; criadoEm novo força recarregar o rascunho.
      salvarPlano({ ...novo, id: rascunho.id, criadoEm: new Date().toISOString() });
    } catch (e) {
      setErro(e instanceof ErroPlano ? e.message : "Não deu pra regenerar agora. Suas edições continuam aqui.");
    } finally {
      setRegenerando(false);
    }
  }

  const verCitacao = (n: number) => setAtiva({ n, k: Date.now() });

  return (
    <Stack gap={3}>
      {/* Cabeçalho */}
      <Box>
        <Button
          component={Link}
          href={`/professor/turma/${rascunho.classId}`}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ color: cores.ink, fontWeight: 700, textTransform: "none", px: 0, mb: 1 }}
        >
          {turmaNome}
        </Button>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
          <Chip
            label={aprovado ? "Aprovado" : "Rascunho"}
            sx={{ fontWeight: 700, border: `2px solid ${cores.ink}`, bgcolor: aprovado ? cores.blue : cores.surface, color: aprovado ? cores.surface : cores.ink }}
          />
          <Chip
            label={rascunho.source === "ai" ? "Gerado com IA" : "Modelo offline"}
            variant="outlined"
            sx={{ fontWeight: 600, border: `2px dashed ${cores.ink}`, color: cores.ink }}
          />
          <Typography role="status" component="span" sx={{ alignSelf: "center", fontSize: 13, color: cores.muted, ml: 0.5 }}>
            {aprovado ? "" : salvo ? "Rascunho salvo" : "Salvando…"}
          </Typography>
        </Stack>
        <TextField
          variant="standard"
          fullWidth
          value={rascunho.titulo}
          onChange={(e) => editar((p) => ({ ...p, titulo: e.target.value }))}
          disabled={aprovado}
          slotProps={{
            htmlInput: { "aria-label": "Título do plano" },
            input: { disableUnderline: aprovado, sx: { fontFamily: fonteDisplay, fontWeight: 800, fontSize: { xs: 28, md: 36 }, lineHeight: 1.1, "&.Mui-disabled": { color: cores.ink, WebkitTextFillColor: cores.ink } } },
          }}
        />
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mt: 1, color: cores.muted, fontSize: 14 }}>
          <span>{turmaNome}</span>·<BnccChip code={rascunho.skillCode} />·<span>{rascunho.interesse}</span>·<span>{DURACAO} min</span>
        </Stack>
      </Box>

      {aprovado && (
        <Alert
          severity="success"
          variant="outlined"
          sx={{ borderColor: cores.ink, borderWidth: 2, borderRadius: "14px", color: cores.ink, "& .MuiAlert-icon": { color: cores.blue } }}
          action={
            <Button onClick={() => reabrirPlano(rascunho.id)} sx={{ color: cores.ink, fontWeight: 700, textTransform: "none" }}>
              Editar novamente
            </Button>
          }
        >
          Aprovado{rascunho.aprovadoEm ? ` em ${new Date(rascunho.aprovadoEm).toLocaleDateString("pt-BR")}` : ""}. Somente leitura.
        </Alert>
      )}

      {erro && (
        <Alert severity="warning" variant="outlined" onClose={() => setErro(null)} sx={{ borderColor: cores.ink, color: cores.ink }}>
          {erro}
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 8fr) minmax(0, 4fr)" }, gap: 3, alignItems: "start" }}>
        <Stack gap={3} sx={{ opacity: regenerando ? 0.5 : 1, pointerEvents: regenerando ? "none" : "auto" }} aria-busy={regenerando}>
          {/* Objetivo */}
          <Box component="section" aria-labelledby="sec-objetivo">
            <Stack gap={1}>
              <TituloSecao id="sec-objetivo">Objetivo</TituloSecao>
              <TextField
                multiline
                minRows={2}
                value={rascunho.objetivo}
                onChange={(e) => editar((p) => ({ ...p, objetivo: e.target.value }))}
                disabled={aprovado}
                error={tentouAprovar && !objetivoOk}
                helperText={tentouAprovar && !objetivoOk ? "Escreva o objetivo antes de aprovar." : undefined}
                slotProps={{ htmlInput: { "aria-labelledby": "sec-objetivo" } }}
                sx={campo}
              />
            </Stack>
          </Box>

          {/* Etapas */}
          <Box component="section" aria-labelledby="sec-etapas">
            <Stack gap={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1} flexWrap="wrap">
                <TituloSecao id="sec-etapas">Etapas</TituloSecao>
                <Typography
                  role="status"
                  sx={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: somaMinutos === DURACAO ? cores.muted : cores.ink }}
                >
                  {somaMinutos} de {DURACAO} min{somaMinutos !== DURACAO ? ` · ${somaMinutos > DURACAO ? "passou" : "faltam"} ${Math.abs(DURACAO - somaMinutos)} min` : " ✓"}
                </Typography>
              </Stack>
              {tentouAprovar && !etapasOk && (
                <Typography sx={{ fontSize: 13, color: cores.ink, fontWeight: 600 }}>Inclua pelo menos uma etapa antes de aprovar.</Typography>
              )}

              <Stack component="ol" gap={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
                {rascunho.etapas.map((e, i) => (
                  <Cartao component="li" key={i} aria-label={`Etapa ${i + 1}`}>
                    <Stack gap={1.25}>
                      <Stack direction="row" gap={1} alignItems="flex-start">
                        <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: "40px", minWidth: 22 }}>{i + 1}</Typography>
                        <TextField
                          size="small"
                          label="Nome da etapa"
                          value={e.nome}
                          onChange={(ev) => editarEtapa(i, { nome: ev.target.value })}
                          disabled={aprovado}
                          sx={{ ...campo, flex: 1 }}
                        />
                        <TextField
                          size="small"
                          label="Min"
                          type="number"
                          value={e.minutos}
                          onChange={(ev) => editarEtapa(i, { minutos: Math.max(0, Math.min(DURACAO, Number(ev.target.value) || 0)) })}
                          disabled={aprovado}
                          slotProps={{ htmlInput: { min: 0, max: DURACAO, inputMode: "numeric" } }}
                          sx={{ ...campo, width: 84 }}
                        />
                        {!aprovado && (
                          <IconButton
                            aria-label={`Remover etapa ${i + 1}`}
                            onClick={() => editar((p) => ({ ...p, etapas: p.etapas.filter((_, j) => j !== i) }))}
                            sx={{ width: 40, height: 40 }}
                          >
                            <DeleteOutlineRoundedIcon />
                          </IconButton>
                        )}
                      </Stack>
                      <TextField
                        multiline
                        minRows={2}
                        label="Descrição"
                        value={e.descricao}
                        onChange={(ev) => editarEtapa(i, { descricao: ev.target.value })}
                        disabled={aprovado}
                        sx={campo}
                      />
                      {e.citacoes.length > 0 && (
                        <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ fontSize: 12, color: cores.muted, fontWeight: 600 }}>Fundamentado em</Typography>
                          {e.citacoes.map((n) => (
                            <Chip
                              key={n}
                              size="small"
                              label={`[${n}]`}
                              onClick={() => verCitacao(n)}
                              aria-label={`Ver citação ${n}`}
                              aria-controls={`citacao-${n}`}
                              sx={{ fontWeight: 700, border: `1.5px solid ${cores.ink}`, bgcolor: ativa?.n === n ? cores.lime : cores.paper }}
                            />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Cartao>
                ))}
              </Stack>
              {!aprovado && (
                <Box>
                  <Button
                    startIcon={<AddRoundedIcon />}
                    onClick={() =>
                      editar((p) => ({
                        ...p,
                        etapas: [...p.etapas, { nome: "", minutos: Math.max(0, DURACAO - somaMinutos), descricao: "", citacoes: [] }],
                      }))
                    }
                    disabled={rascunho.etapas.length >= 6}
                    sx={{ color: cores.ink, fontWeight: 700, textTransform: "none", border: `2px dashed ${cores.ink}`, borderRadius: 999, px: 2 }}
                  >
                    Adicionar etapa
                  </Button>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Avaliação */}
          <Box component="section" aria-labelledby="sec-avaliacao">
            <Stack gap={1}>
              <TituloSecao id="sec-avaliacao">Avaliação</TituloSecao>
              <TextField
                multiline
                minRows={2}
                value={rascunho.avaliacao}
                onChange={(e) => editar((p) => ({ ...p, avaliacao: e.target.value }))}
                disabled={aprovado}
                slotProps={{ htmlInput: { "aria-labelledby": "sec-avaliacao" } }}
                sx={campo}
              />
            </Stack>
          </Box>

          {/* Adaptações */}
          <Box component="section" aria-labelledby="sec-adaptacoes">
            <Stack gap={1.25}>
              <Stack gap={0.25}>
                <TituloSecao id="sec-adaptacoes">Adaptações por nível</TituloSecao>
                <Typography sx={{ fontSize: 13, color: cores.muted }}>
                  Por nível na habilidade, nunca por aluno nominal.
                </Typography>
              </Stack>
              {rascunho.adaptacoes.map((a, i) => (
                <TextField
                  key={a.nivel}
                  multiline
                  minRows={2}
                  label={ROTULO_ADAPTACAO[a.nivel]}
                  value={a.sugestao}
                  onChange={(e) =>
                    editar((p) => ({ ...p, adaptacoes: p.adaptacoes.map((x, j) => (j === i ? { ...x, sugestao: e.target.value } : x)) }))
                  }
                  disabled={aprovado}
                  sx={campo}
                />
              ))}
            </Stack>
          </Box>

          <EthicsSeal
            selo={rascunho.seloEtico}
            somenteLeitura={aprovado}
            onMudar={(selo) => editar((p) => ({ ...p, seloEtico: selo }))}
            onVerCitacao={verCitacao}
          />

          {/* Ações */}
          {!aprovado && (
            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="space-between"
              gap={1.5}
              sx={{ borderTop: `2px solid ${cores.ink}`, pt: 2.5 }}
            >
              <Button
                startIcon={regenerando ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : <RefreshRoundedIcon />}
                onClick={() => setConfirmarRegen(true)}
                disabled={regenerando}
                sx={{ color: cores.ink, fontWeight: 700, textTransform: "none", border: `2px solid ${cores.ink}`, borderRadius: 999, px: 2.5, minHeight: 48 }}
              >
                {regenerando ? "Consultando BNCC e Referencial…" : "Regenerar"}
              </Button>
              <Button
                variant="contained"
                onClick={aprovar}
                sx={{
                  minHeight: 56,
                  px: 3.5,
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 17,
                  textTransform: "none",
                  bgcolor: cores.blue,
                  color: cores.surface,
                  border: `2px solid ${cores.ink}`,
                  boxShadow: `4px 4px 0 ${cores.ink}`,
                  "&:hover": { bgcolor: cores.blue, boxShadow: `5px 5px 0 ${cores.ink}` },
                }}
              >
                Aprovar plano
              </Button>
            </Stack>
          )}
        </Stack>

        <Box>
          <Overline>Fundamentação</Overline>
          <Box sx={{ mt: 1 }}>
            <CitationsPanel citacoes={rascunho.citacoes} ativa={ativa} />
          </Box>
        </Box>
      </Box>

      <Dialog
        open={confirmarRegen}
        onClose={() => setConfirmarRegen(false)}
        aria-labelledby="titulo-regen"
        slotProps={{ paper: { sx: { border: `2px solid ${cores.ink}`, borderRadius: "20px" } } }}
      >
        <DialogTitle id="titulo-regen" sx={{ fontWeight: 800 }}>
          Regenerar o plano?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: cores.ink }}>
            A IA consulta de novo a BNCC e o Referencial e monta outra versão. Suas edições neste plano serão perdidas.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmarRegen(false)} sx={{ color: cores.ink, fontWeight: 700, textTransform: "none" }}>
            Manter este
          </Button>
          <Button
            variant="contained"
            onClick={regenerar}
            sx={{ borderRadius: 999, fontWeight: 700, textTransform: "none", bgcolor: cores.ink, "&:hover": { bgcolor: cores.ink } }}
          >
            Regenerar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={aviso}
        autoHideDuration={6000}
        onClose={() => setAviso(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setAviso(false)}
          sx={{ bgcolor: cores.ink, color: cores.surface, borderRadius: "14px", "& .MuiAlert-icon": { color: cores.lime } }}
          action={
            <Button onClick={() => router.push("/professor/planos")} sx={{ color: cores.lime, fontWeight: 700, textTransform: "none" }}>
              Ver planos
            </Button>
          }
        >
          Plano aprovado. Ele é seu — a IA só sugeriu.
        </Alert>
      </Snackbar>
    </Stack>
  );
}
