/** Remonta a cada navegação: dispara a entrada curta da página (keyframes em lib/theme.ts). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="g26-page">{children}</div>;
}
