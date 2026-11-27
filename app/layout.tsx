import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Sora } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import { AppStoreProvider } from "@/lib/store/AppStore";
import { DemoBar, DEMOBAR_HEIGHT, SkipLink } from "@/components/shell";
import PointsToast from "@/components/ui/PointsToast";
import { APP_NAME, APP_TAGLINE, DEMO } from "@/lib/config";
import { tokens } from "@/lib/theme";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-display", display: "swap" });
const brandFont = Sora({ subsets: ["latin"], weight: ["600"], variable: "--font-brand", display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: `${APP_TAGLINE} Descubra pra onde a escola te leva: ficha BNCC, carreiras, missões e Match Day com mentores.`,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  // Ícones: app/icon.svg (favicon adaptativo claro/escuro) e app/apple-icon.png, pela convenção do Next.
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: tokens.ink };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${brandFont.variable}`}>
      <body style={{ ["--demobar-h" as string]: DEMO.enabled ? `${DEMOBAR_HEIGHT}px` : "0px" }}>
        <ThemeRegistry>
          <AppStoreProvider>
            <SkipLink />
            <DemoBar />
            {children}
            <PointsToast />
          </AppStoreProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
