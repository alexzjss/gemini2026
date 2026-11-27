"use client";
import Box from "@mui/material/Box";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import SparkIcon from "./SparkIcon";
import { useAppStore } from "@/lib/store/AppStore";
import { border, hardShadow, tokens } from "@/lib/theme";

/** Toast global "+N pts": sobe 16px e some (~600ms após 2,4s). Fica acima da bottom nav. */
export default function PointsToast() {
  const { ui, dispatch } = useAppStore();
  const reduce = useReducedMotion();
  const toast = ui.toasts[0];

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => dispatch({ type: "dismissToast", id: toast.id }), 2600);
    return () => window.clearTimeout(t);
  }, [toast, dispatch]);

  return (
    <Box aria-live="polite" role="status"
      sx={{ position: "fixed", left: 0, right: 0, bottom: { xs: 104, md: 32 }, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 1500 }}>
      <AnimatePresence>
        {toast && (
          <Box
            component={motion.div}
            key={toast.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: tokens.lime, color: tokens.ink, border, boxShadow: hardShadow, borderRadius: 999, px: 2, py: 1.25, fontWeight: 700, fontSize: 15 }}
          >
            {toast.pontos ? (
              <>
                <SparkIcon sx={{ fontSize: 18 }} />
                <span>+{toast.pontos} pts</span>
                <Box component="span" sx={{ fontWeight: 600 }}>· {toast.texto}</Box>
              </>
            ) : (
              <span>{toast.texto}</span>
            )}
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
