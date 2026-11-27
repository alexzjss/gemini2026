"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { motion as fm, useReducedMotion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { border, layout, motion, tokens } from "@/lib/theme";
import type { NavItem } from "./nav";

export const SIDEBAR_WIDTH = layout.sidebar;

/** Sidebar desktop (branca, borda direita 2px; item ativo lime + borda, raio 14).
 *  O destaque do item ativo desliza entre itens (layoutId). */
export default function Sidebar({
  items, footer, label = "Navegação principal", id = "sidebar",
}: { items: NavItem[]; footer?: React.ReactNode; label?: string; id?: string }) {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();
  return (
    <Box component="aside" sx={{
      display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 4, width: SIDEBAR_WIDTH, flex: "none",
      px: 2, pt: 3.5, pb: 2.5, bgcolor: tokens.surface, borderRight: border, position: "sticky", top: "var(--demobar-h, 0px)",
      height: "calc(100dvh - var(--demobar-h, 0px))", overflowY: "auto", boxSizing: "border-box",
    }}>
      <Box sx={{ px: 1 }}><Logo size={16} /></Box>
      <Box component="nav" aria-label={label}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {items.map((it) => {
            const active = it.match(pathname);
            return (
              <Box component="li" key={it.label} sx={{ position: "relative" }}>
                {active && (
                  <Box
                    component={fm.span}
                    layoutId={`${id}-ativo`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
                    aria-hidden
                    sx={{ position: "absolute", inset: 0, bgcolor: tokens.lime, border, borderRadius: "14px", boxShadow: `2px 2px 0 ${tokens.ink}` }}
                  />
                )}
                <Box component={NextLink} href={it.href} aria-current={active ? "page" : undefined}
                  sx={{
                    position: "relative", display: "flex", alignItems: "center", gap: 1.5, minHeight: 48, px: 2, borderRadius: "14px",
                    color: active ? tokens.ink : tokens.muted, fontWeight: active ? 700 : 600, fontSize: 15, lineHeight: 1.2,
                    textDecoration: "none", whiteSpace: "nowrap",
                    transition: `color ${motion.fast}ms ${motion.ease}, background-color ${motion.fast}ms ${motion.ease}`,
                    "& svg": { transition: `transform ${motion.fast}ms ${motion.ease}` },
                    "&:hover": { color: tokens.ink, bgcolor: active ? "transparent" : tokens.paper },
                    "&:hover svg": { transform: active ? "none" : "scale(1.12)" },
                  }}>
                  <it.Icon fontSize="small" />
                  {it.label}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      {footer && <Box sx={{ mt: "auto", pt: 2, px: 1, borderTop: `2px solid ${tokens.track}` }}>{footer}</Box>}
    </Box>
  );
}

export function SidebarUser({ avatar, nome, sub }: { avatar: React.ReactNode; nome: string; sub: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      <Box sx={{ flex: "none", display: "flex" }}>{avatar}</Box>
      <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Typography component="strong" noWrap sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{nome}</Typography>
        <Typography component="span" noWrap sx={{ color: tokens.muted, fontSize: 13, lineHeight: 1.3 }}>{sub}</Typography>
      </Box>
    </Box>
  );
}
