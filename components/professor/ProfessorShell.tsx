"use client";

import { Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { motion as fm, useReducedMotion } from "framer-motion";
import Sidebar, { SidebarUser } from "@/components/shell/Sidebar";
import type { NavItem } from "@/components/shell/nav";
import { Avatar, Logo } from "@/components/ui";
import { border, layout, motion, tokens } from "@/lib/theme";
import { useSessaoProfessor } from "./dados/fonte";

/**
 * Shell do professor (docs/10 · TeacherShell): mesma sidebar do aluno no
 * desktop (Turma · Planos + rodapé com o professor) e barra superior no mobile.
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
  const reduce = useReducedMotion();
  // Guarda: sem sessão de professor, volta pra tela inicial.
  useEffect(() => {
    if (hidratado && !ok) router.replace("/");
  }, [hidratado, ok, router]);
  const classId = turmaDaRota(pathname);

  const itens: NavItem[] = [
    { href: `/professor/turma/${classId}`, label: "Turma", Icon: GridViewRoundedIcon, match: (p) => p.startsWith("/professor/turma") },
    { href: "/professor/planos", label: "Planos", Icon: DescriptionRoundedIcon, match: (p) => p.startsWith("/professor/plano") },
  ];
  const inicial = professor.nome.replace(/^Prof\.ª\s*/, "")[0];

  return (
    <Box sx={{ minHeight: "calc(100dvh - var(--demobar-h, 0px))", bgcolor: tokens.paper, color: tokens.ink, display: { xs: "block", md: "flex" } }}>
      <Sidebar
        id="sidebar-prof"
        homeHref={`/professor/turma/${classId}`}
        label="Navegação do professor"
        items={itens}
        footer={<SidebarUser avatar={<Avatar inicial={inicial} />} nome={professor.nome} sub={professor.disciplina} />}
      />

      {/* Mobile */}
      <Box
        component="header"
        sx={{
          display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "space-between", gap: 1,
          px: 2, py: 1.25, bgcolor: alpha(tokens.surface, 0.94), backdropFilter: "saturate(1.4) blur(10px)",
          borderBottom: border, position: "sticky", top: "var(--demobar-h, 0px)", zIndex: 1050,
        }}
      >
        <Logo size={18} collapseBelow={380} href={`/professor/turma/${classId}`} />
        <Box component="nav" aria-label="Navegação do professor">
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", gap: 0.5 }}>
            {itens.map((i) => {
              const ativo = i.match(pathname);
              return (
                <Box component="li" key={i.label} sx={{ position: "relative" }}>
                  {ativo && (
                    <Box component={fm.span} layoutId="prof-topnav-ativo" aria-hidden
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
                      sx={{ position: "absolute", inset: 0, bgcolor: tokens.lime, border, borderRadius: 999 }} />
                  )}
                  <Box
                    component={Link}
                    href={i.href}
                    aria-current={ativo ? "page" : undefined}
                    sx={{
                      position: "relative", display: "flex", alignItems: "center", gap: 0.75, minHeight: 44, px: 1.75,
                      borderRadius: 999, textDecoration: "none", fontWeight: ativo ? 700 : 600, fontSize: 15,
                      color: ativo ? tokens.ink : tokens.muted, transition: `color ${motion.fast}ms ${motion.ease}`,
                    }}
                  >
                    <i.Icon fontSize="small" />
                    {i.label}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box component="main" id="conteudo" sx={{ flex: 1, minWidth: 0, px: { xs: 2, sm: 3, md: 5, lg: 6 }, pt: { xs: 3, md: 5 }, pb: 8 }}>
        <Box sx={{ width: "100%", maxWidth: layout.contentTeacher, mx: "auto" }}>{hidratado && ok ? children : null}</Box>
      </Box>
    </Box>
  );
}
