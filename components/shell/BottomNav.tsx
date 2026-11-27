"use client";
import Box from "@mui/material/Box";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { border, tokens } from "@/lib/theme";
import type { NavItem } from "./nav";

/** Bottom nav mobile: 4 itens; ativo = ícone em pill `lime` com borda. */
export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? "";
  return (
    <Box component="nav" aria-label="Navegação principal" sx={{
      display: { xs: "grid", md: "none" }, gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))`,
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1100, bgcolor: tokens.surface, borderTop: border,
      px: 1, pt: 1, pb: "calc(12px + env(safe-area-inset-bottom))",
    }}>
      {items.map((it) => {
        const active = it.match(pathname);
        return (
          <Box key={it.href} component={NextLink} href={it.href} aria-current={active ? "page" : undefined}
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, minHeight: 48,
              textDecoration: "none", color: active ? tokens.ink : tokens.muted, fontSize: 12, fontWeight: active ? 700 : 600,
              borderRadius: "12px",
            }}>
            <Box component="span" sx={{
              display: "flex", borderRadius: 999, px: active ? 1.75 : 2, py: active ? 0.25 : 0.5,
              bgcolor: active ? tokens.lime : "transparent", border: active ? border : 0,
            }}>
              <it.Icon fontSize="small" />
            </Box>
            {it.label}
          </Box>
        );
      })}
    </Box>
  );
}
