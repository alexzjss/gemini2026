"use client";

import { Box, Typography } from "@mui/material";
import Stack from "./Stack";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui";
import { cores } from "./cores";
import { useSessaoProfessor } from "./dados/fonte";

/**
 * Shell do professor (docs/10 · TeacherShell): sidebar 232px no desktop com
 * Turma · Planos e rodapé com o professor; barra superior no mobile.
 *
 * Fica nesta pasta porque F8.1 é do Agente 5. Se o Agente 1 publicar um
 * `components/shell/TeacherShell`, o layout pode trocar por ele.
 */

const TURMA_PADRAO = "2A";

function turmaDaRota(pathname: string) {
  const m = pathname.match(/^\/professor\/turma\/([^/]+)/);
  return m?.[1] ?? TURMA_PADRAO;
}

export default function ProfessorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const { professor, ok, hidratado } = useSessaoProfessor();
  const router = useRouter();
  // Guarda: sem sessão de professor, volta pra tela inicial.
  useEffect(() => {
    if (hidratado && !ok) router.replace("/");
  }, [hidratado, ok, router]);
  const classId = turmaDaRota(pathname);

  const itens = [
    {
      href: `/professor/turma/${classId}`,
      label: "Turma",
      icone: <GridViewRoundedIcon fontSize="small" />,
      ativo: pathname.startsWith("/professor/turma"),
    },
    {
      href: "/professor/planos",
      label: "Planos",
      icone: <DescriptionRoundedIcon fontSize="small" />,
      ativo: pathname.startsWith("/professor/plano"),
    },
  ];

  const logo = (
    <Box sx={{ alignSelf: { md: "flex-start" } }}>
      <Logo size={18} collapseBelow={380} href={`/professor/turma/${classId}`} />
    </Box>
  );

  const nav = (direcao: "row" | "column") => (
    <Stack component="ul" direction={direcao} gap={0.75} sx={{ listStyle: "none", p: 0, m: 0 }}>
      {itens.map((i) => (
        <li key={i.label}>
          <Box
            component={Link}
            href={i.href}
            aria-current={i.ativo ? "page" : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minHeight: 48,
              px: 2,
              borderRadius: "14px",
              textDecoration: "none",
              fontWeight: i.ativo ? 700 : 600,
              fontSize: 15,
              color: i.ativo ? cores.ink : cores.muted,
              bgcolor: i.ativo ? cores.lime : "transparent",
              border: `2px solid ${i.ativo ? cores.ink : "transparent"}`,
              "&:hover": { color: cores.ink },
              "&:focus-visible": { outline: `3px solid ${cores.blue}`, outlineOffset: 2 },
            }}
          >
            {i.icone}
            {i.label}
          </Box>
        </li>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: cores.paper, color: cores.ink, display: { xs: "block", md: "flex" } }}>
      {/* Desktop */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          gap: 3.5,
          width: 232,
          flexShrink: 0,
          px: 2.5,
          py: 3.5,
          bgcolor: cores.surface,
          borderRight: `2px solid ${cores.ink}`,
          position: "sticky",
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
        }}
      >
        {logo}
        <nav aria-label="Navegação do professor">{nav("column")}</nav>
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: "auto" }}>
          <Box
            aria-hidden
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: cores.blue,
              color: cores.surface,
              border: `2px solid ${cores.ink}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {professor.nome.replace(/^Prof\.ª\s*/, "")[0]}
          </Box>
          <Stack sx={{ fontSize: 14, minWidth: 0 }}>
            <Typography component="strong" sx={{ fontWeight: 700, fontSize: 14 }}>
              {professor.nome}
            </Typography>
            <Typography component="span" sx={{ color: cores.muted, fontSize: 14 }}>
              {professor.disciplina}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Mobile */}
      <Box
        component="header"
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 2,
          py: 1,
          bgcolor: cores.surface,
          borderBottom: `2px solid ${cores.ink}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {logo}
        <nav aria-label="Navegação do professor">{nav("row")}</nav>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2, md: 5 }, pt: { xs: 2.5, md: 5 }, pb: 7 }}>
        <Box sx={{ width: "100%" }}>{hidratado && ok ? children : null}</Box>
      </Box>
    </Box>
  );
}
