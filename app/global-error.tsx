"use client";
/* F9.3 — falha no layout raiz: HTML mínimo, sem MUI (só os tokens). */
import { tokens } from "@/lib/theme";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: tokens.paper, color: tokens.ink }}>
        <main style={{ maxWidth: 520, margin: "64px auto", padding: 24, border: `2px solid ${tokens.ink}`, borderRadius: 20, background: tokens.surface }}>
          <h1 style={{ marginTop: 0 }}>Ops, algo travou aqui.</h1>
          <p>Seu progresso está salvo neste navegador. Tenta recarregar.</p>
          <button type="button" onClick={reset} style={{ minHeight: 48, padding: "0 22px", borderRadius: 999, border: `2px solid ${tokens.ink}`, background: tokens.lime, fontWeight: 700, fontSize: 16 }}>
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
