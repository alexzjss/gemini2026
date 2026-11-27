"use client";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store/AppStore";
import { classes, teacher } from "@/lib/store/seed";
import { Avatar, Logo, LoadingState } from "@/components/ui";
import Sidebar, { SidebarUser } from "./Sidebar";
import { NAV_PROFESSOR } from "./nav";
import { DEMO } from "@/lib/config";
import { border, tokens } from "@/lib/theme";

export function useTurmaAtual(): string {
  const pathname = usePathname() ?? "";
  return pathname.match(/^\/professor\/turma\/([^/]+)/)?.[1] ?? DEMO.turmaPadrao;
}

/** Seletor de turma (topo do conteúdo do professor). */
export function ClassSelect() {
  const router = useRouter();
  const atual = useTurmaAtual();
  return (
    <TextField select size="small" label="Turma" value={atual} sx={{ width: { xs: "100%", sm: 220 } }}
      onChange={(e) => router.push(`/professor/turma/${e.target.value}`)}>
      {classes.filter((c) => teacher.classIds.includes(c.id)).map((c) => (
        <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
      ))}
    </TextField>
  );
}

/** Shell do professor: guarda de sessão, sidebar (Turma · Planos), versão sóbria. */
export default function TeacherShell({ children }: { children: React.ReactNode }) {
  const { state, ui } = useAppStore();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const isProf = state.sessao?.role === "professor";

  useEffect(() => {
    if (ui.hydrated && !isProf) router.replace("/");
  }, [ui.hydrated, isProf, router]);

  if (!ui.hydrated || !isProf) return <LoadingState texto="Abrindo o painel da turma…" />;

  const iniciais = teacher.nome.replace("Prof.ª ", "").charAt(0);
  return (
    <Box sx={{ display: "flex", minHeight: "calc(100dvh - var(--demobar-h, 0px))", bgcolor: tokens.paper }}>
      <Sidebar
        label="Navegação do professor"
        items={NAV_PROFESSOR}
        footer={<SidebarUser avatar={<Avatar inicial={iniciais} tone="ink" />} nome={teacher.nome} sub={teacher.disciplina} />}
      />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box component="header" sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1.5, px: 2.5, pt: 2.5, pb: 1.5, borderBottom: border, bgcolor: tokens.surface }}>
          <Logo />
          <Box component="nav" aria-label="Navegação do professor" sx={{ display: "flex", gap: 1 }}>
            {NAV_PROFESSOR.map((it) => {
              const active = it.match(pathname);
              return (
                <Box key={it.href} component={NextLink} href={it.href} aria-current={active ? "page" : undefined}
                  sx={{ display: "inline-flex", alignItems: "center", gap: 1, minHeight: 44, px: 2, borderRadius: 999, textDecoration: "none",
                    color: tokens.ink, fontWeight: active ? 700 : 600, fontSize: 15, bgcolor: active ? tokens.lime : "transparent", border: active ? border : "2px solid transparent" }}>
                  <it.Icon fontSize="small" /> {it.label}
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box component="main" id="conteudo" sx={{ flex: 1, width: "100%", maxWidth: { md: 1280 + 96 }, px: { xs: 2.5, md: 5 }, py: { xs: 3, md: 5 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
