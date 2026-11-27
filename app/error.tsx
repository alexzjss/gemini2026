"use client";
/* F9.3 — erro de rota: texto amigável, nunca stack trace. */
import { useEffect } from "react";
import { ErrorState } from "@/components/ui";

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Só no console do navegador, para o time depurar; nada aparece na tela.
    console.warn("[demo] erro de rota recuperado", error.digest ?? "");
  }, [error]);
  return <ErrorState acao={reset} />;
}
