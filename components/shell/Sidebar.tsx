"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { border, tokens } from "@/lib/theme";
import type { NavItem } from "./nav";

export const SIDEBAR_WIDTH = 232;

/** Sidebar desktop (232px, branca, borda direita 2px; item ativo lime + borda, raio 14). */
export default function Sidebar({ items, footer, label = "Navegação principal" }: { items: NavItem[]; footer?: React.ReactNode; label?: string }) {
  const pathname = usePathname() ?? "";
  return (
    <Box component="aside" sx={{
      display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 3.5, width: SIDEBAR_WIDTH, flex: "none",
      px: 2.5, py: 3.5, bgcolor: tokens.surface, borderRight: border, position: "sticky", top: "var(--demobar-h, 0px)",
      height: "calc(100dvh - var(--demobar-h, 0px))", overflowY: "auto",
    }}>
      <Box><Logo size={16} /></Box>
      <Box component="nav" aria-label={label} sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {items.map((it) => {
          const active = it.match(pathname);
          return (
            <Box key={it.label} component={NextLink} href={it.href} aria-current={active ? "page" : undefined}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5, minHeight: 48, px: active ? 1.75 : 2, borderRadius: "14px",
                bgcolor: active ? tokens.lime : "transparent", border: active ? border : "2px solid transparent",
                color: active ? tokens.ink : tokens.muted, fontWeight: active ? 700 : 600, fontSize: 15, textDecoration: "none",
                "&:hover": { color: tokens.ink, bgcolor: active ? tokens.lime : tokens.paper },
              }}>
              <it.Icon fontSize="small" />
              {it.label}
            </Box>
          );
        })}
      </Box>
      {footer && <Box sx={{ mt: "auto" }}>{footer}</Box>}
    </Box>
  );
}

export function SidebarUser({ avatar, nome, sub }: { avatar: React.ReactNode; nome: string; sub: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      {avatar}
      <Box sx={{ display: "flex", flexDirection: "column", fontSize: 14, minWidth: 0 }}>
        <Typography component="strong" sx={{ fontWeight: 700, fontSize: 14 }}>{nome}</Typography>
        <Typography component="span" sx={{ color: tokens.muted, fontSize: 13 }}>{sub}</Typography>
      </Box>
    </Box>
  );
}
