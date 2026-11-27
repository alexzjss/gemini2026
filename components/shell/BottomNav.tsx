"use client";
import Box from "@mui/material/Box";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { motion as fm, useReducedMotion } from "framer-motion";
import { alpha } from "@mui/material/styles";
import { border, motion, tokens } from "@/lib/theme";
import type { NavItem } from "./nav";

/** Bottom nav mobile: 4 itens; ativo = ícone em pill `lime` com borda, que desliza entre itens. */
export default function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();
  return (
    <Box component="nav" aria-label="Navegação principal" sx={{
      display: { xs: "grid", md: "none" }, gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))`,
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1100,
      bgcolor: alpha(tokens.surface, 0.94), backdropFilter: "saturate(1.4) blur(10px)", borderTop: border,
      px: 1, pt: 1, pb: "calc(10px + env(safe-area-inset-bottom))",
    }}>
      {items.map((it) => {
        const active = it.match(pathname);
        return (
          <Box key={it.href} component={NextLink} href={it.href} aria-current={active ? "page" : undefined}
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, minHeight: 52,
              textDecoration: "none", color: active ? tokens.ink : tokens.muted, fontSize: 12, fontWeight: active ? 700 : 600,
              borderRadius: "12px", WebkitTapHighlightColor: "transparent",
              transition: `color ${motion.fast}ms ${motion.ease}, transform ${motion.fast}ms ${motion.ease}`,
              "&:active": { transform: "scale(.94)" },
            }}>
            <Box component="span" sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 30 }}>
              {active && (
                <Box component={fm.span} layoutId="bottomnav-ativo" aria-hidden
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                  sx={{ position: "absolute", inset: 0, borderRadius: 999, bgcolor: tokens.lime, border }} />
              )}
              <it.Icon fontSize="small" sx={{ position: "relative" }} />
            </Box>
            {it.label}
          </Box>
        );
      })}
    </Box>
  );
}
