"use client";
import Box from "@mui/material/Box";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppStore, useSessionStudentId } from "@/lib/store/AppStore";
import { useStudentView } from "@/lib/store/hooks";
import { Avatar, Logo, PointsPill, LoadingState, formatPontos } from "@/components/ui";
import Sidebar, { SidebarUser } from "./Sidebar";
import BottomNav from "./BottomNav";
import { NAV_ALUNO_DESKTOP, NAV_ALUNO_MOBILE, isFlowRoute } from "./nav";
import { tokens } from "@/lib/theme";

/** Shell do aluno: guarda (sessão + consentimento), header/bottom nav no mobile, sidebar no desktop. */
export default function StudentShell({ children }: { children: React.ReactNode }) {
  const { state, ui } = useAppStore();
  const studentId = useSessionStudentId();
  const view = useStudentView(studentId);
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const consentido = Boolean(view?.local.consentAt);
  const naConsentimento = pathname === "/aluno/consentimento";

  useEffect(() => {
    if (!ui.hydrated) return;
    if (!studentId || !view) router.replace("/");
    else if (!consentido && !naConsentimento) router.replace("/aluno/consentimento");
  }, [ui.hydrated, studentId, view, consentido, naConsentimento, router, state.sessao]);

  if (!ui.hydrated || !view || (!consentido && !naConsentimento)) {
    return <LoadingState texto="Abrindo seu espaço…" />;
  }

  if (isFlowRoute(pathname)) return <>{children}</>;

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100dvh - var(--demobar-h, 0px))", bgcolor: tokens.paper }}>
      <Sidebar
        items={NAV_ALUNO_DESKTOP}
        footer={
          <SidebarUser
            avatar={<Avatar inicial={view.student.inicial} />}
            nome={view.student.nome}
            sub={`Nível ${view.nivel} · ${formatPontos(view.pontos)} pts`}
          />
        }
      />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box component="header" sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 2.5, pb: 1 }}>
          <Logo />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PointsPill pontos={view.pontos} />
            <Box component={NextLink} href="/aluno/perfil" aria-label="Abrir meu perfil" sx={{ borderRadius: "50%", display: "flex" }}>
              <Avatar inicial={view.student.inicial} />
            </Box>
          </Box>
        </Box>
        <Box component="main" id="conteudo" sx={{
          flex: 1, width: "100%", maxWidth: { md: 1120 + 96 }, px: { xs: 2.5, md: 6 }, pt: { xs: 1, md: 5 },
          pb: { xs: "120px", md: 7 },
        }}>
          {children}
        </Box>
      </Box>
      <BottomNav items={NAV_ALUNO_MOBILE} />
    </Box>
  );
}
