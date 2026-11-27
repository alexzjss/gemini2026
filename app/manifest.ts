import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { brand } from "@/lib/theme";

/** Manifest PWA: permite "Adicionar à tela inicial" com nome e ícone Próxio. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} · ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description: APP_TAGLINE,
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: brand.neve,
    theme_color: brand.neve,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
      { src: "/icons/maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
