"use client";
/* Tela 3 — Início (docs/10). */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NextLink from "next/link";
import { BnccChip, LimeCard, Overline, PillButton, PointsPill, SurfaceCard, formatPontos } from "@/components/ui";
import { CareerTop, LevelCard, primeiroNome } from "@/components/aluno/blocos";
import MatchDayCard from "@/app/aluno/match/_components/MatchDayCard";
import { useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { NIVEIS } from "@/lib/config";
import { border, fonts, hardShadow, motion, tokens } from "@/lib/theme";

export default function Inicio() {
  const view = useStudentView(useSessionStudentId());
  if (!view) return null;
  const m = view.missaoDoDia;
  const proxima = view.sugestoes.find((s) => s && !s.feitaHoje);
  const g = view.galera;
  const altaDemanda = NIVEIS[3];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "14px", md: 4 } }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 2 }}>
        <Box>
          <Typography variant="h1">E aí, {primeiroNome(view)}.</Typography>
          <Typography sx={{ mt: 1, fontSize: { xs: 15, md: 17 }, color: tokens.muted, "& strong": { color: tokens.ink } }}>
            {view.nivel < 5 ? (
              <>Faltam <strong>{formatPontos(view.faltam)} pontos</strong> pro nível {view.nivel + 1}, que abre {NIVEIS[view.nivel].abre}.</>
            ) : "Você chegou no topo. Referência!"}
          </Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "block" } }}><PointsPill pontos={view.pontos} suffix="pontos" large /></Box>
      </Box>

      {/* Mobile: nível → missão → Da Galera → Match Day. Desktop: duas colunas alinhadas no topo. */}
      <Box sx={{
        display: { xs: "flex", md: "grid" }, flexDirection: "column", gridTemplateColumns: { md: "minmax(0, 1.55fr) minmax(300px, 1fr)" },
        gap: { xs: "14px", md: 3 }, alignItems: "start",
      }}>
        <Box sx={{ display: { xs: "contents", md: "flex" }, flexDirection: "column", gap: 3, minWidth: 0 }}>
        {m ? (
          <LimeCard component="section" aria-label="Missão do dia" sx={{ order: { xs: 2, md: 0 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
              <Overline>Missão do dia</Overline>
              <BnccChip code={m.code} tone="ink" />
            </Box>
            <Typography variant="h2" component="h2" sx={{ maxWidth: 640 }}>{m.titulo}</Typography>
            {m.feitaHoje ? (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 600 }}>Feita hoje ✓ · volta amanhã</Typography>
                {proxima && <PillButton href={`/aluno/missoes/${proxima.code}`} color="ink" size="small" arrow>Próxima</PillButton>}
              </Box>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 600 }}>+30 pts · {m.minutos} min</Typography>
                <PillButton href={`/aluno/missoes/${m.code}`} color="ink" arrow>Começar</PillButton>
              </Box>
            )}
          </LimeCard>
        ) : null}
          <Box sx={{ order: { xs: 4, md: 0 } }}><MatchDayCard view={view} /></Box>
        </Box>
        <Box sx={{ display: { xs: "contents", md: "flex" }, flexDirection: "column", gap: 3, minWidth: 0 }}>
          <Box sx={{ order: { xs: 1, md: 0 } }}><LevelCard view={view} /></Box>
        {!g.concluido ? (
          <SurfaceCard component={NextLink} href="/aluno/galera" sx={{ order: { xs: 3, md: 0 }, flexDirection: "row", alignItems: "center", gap: 1.75, textDecoration: "none", color: tokens.ink }}>
            <Box sx={{ width: 52, height: 52, flex: "none", borderRadius: "14px", bgcolor: tokens.blue, color: tokens.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 800, fontSize: 18 }}>
              {g.respondidos}/{g.total}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>{g.respondidos ? "Continua o Da Galera" : "Faz o Da Galera"}</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.muted }}>
                {g.respondidos ? `Faltam ${g.faltam} cenários, uns ${Math.max(1, Math.round(g.faltam * 0.6))} minutos` : `${g.total} cenários, uns 5 minutos`}
              </Typography>
            </Box>
            <ChevronRightRoundedIcon aria-hidden />
          </SurfaceCard>
        ) : view.semana.concluido ? (
          <SurfaceCard component={NextLink} href="/aluno/galera/resultado" sx={{ order: { xs: 3, md: 0 }, flexDirection: "row", alignItems: "center", gap: 1.75, textDecoration: "none", color: tokens.ink }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Seu resultado do Da Galera</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.muted }}>Desafio da semana feito ✓ · volta semana que vem</Typography>
            </Box>
            <ChevronRightRoundedIcon aria-hidden />
          </SurfaceCard>
        ) : (
          <SurfaceCard component={NextLink} href="/aluno/semana" sx={{ order: { xs: 3, md: 0 }, flexDirection: "row", alignItems: "center", gap: 1.75, textDecoration: "none", color: tokens.ink }}>
            <Box sx={{ width: 52, height: 52, flex: "none", borderRadius: "14px", bgcolor: tokens.ink, color: tokens.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 800, fontSize: 18 }}>+10</Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Desafio da semana</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.muted }}>{view.semana.cenarios.length} cenários que afinam seu perfil</Typography>
            </Box>
            <ChevronRightRoundedIcon aria-hidden />
          </SurfaceCard>
        )}

        </Box>


      </Box>

      <Box component="section" aria-labelledby="carreiras-titulo" sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 }, mt: { md: 1 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2 }}>
          <Typography id="carreiras-titulo" variant="h3" component="h2">Carreiras que combinam com você</Typography>
          <Box component={NextLink} href="/aluno/carreiras" sx={{ fontWeight: 700, color: tokens.ink, whiteSpace: "nowrap", textUnderlineOffset: 3, "&:hover": { color: tokens.blue } }}>Abrir o swipe</Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(240px, 1fr))" }, gap: { xs: "14px", md: 3 } }}>
          {view.fila.slice(0, 3).map(({ career, combina, ondeAEscola }) => (
            <Box key={career.id} component={NextLink} href={`/aluno/carreiras/${career.id}`}
              sx={{
                border, borderRadius: { xs: "20px", md: "24px" }, overflow: "hidden", textDecoration: "none", bgcolor: tokens.surface, color: tokens.ink,
                display: "flex", flexDirection: "column", transition: `transform ${motion.fast}ms ${motion.ease}, box-shadow ${motion.fast}ms ${motion.ease}`,
                "&:hover": { transform: "translate(-2px,-2px)", boxShadow: hardShadow },
                "&:active": { transform: "translate(1px,1px)", boxShadow: "none" },
              }}>
              <CareerTop career={career} combina={combina} sx={{ flex: 1, justifyContent: "flex-end", minHeight: { md: 168 } }} />
              {ondeAEscola && (
                <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                  <BnccChip code={ondeAEscola.code} />
                  <Typography sx={{ fontSize: 14, color: tokens.muted }}>{ondeAEscola.frase}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {view.nivel < 4 && (
        <SurfaceCard component="section" aria-label="Mentores de alta demanda" sx={{ borderStyle: "dashed" }}>
          <Typography variant="h4" component="h2">Mentores de alta demanda</Typography>
          <Typography sx={{ color: tokens.muted }}>
            Big Tech, medicina, executivos · abrem no nível 4 · faltam {formatPontos(Math.max(0, altaDemanda.min - view.pontos))} pts
          </Typography>
          <Box><PillButton href="/aluno/missoes" variant="outlined" size="small" arrow>Ver como chegar lá</PillButton></Box>
        </SurfaceCard>
      )}
    </Box>
  );
}
