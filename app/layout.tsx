import type { Metadata } from "next";
import { Suspense } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/hooks/useUser";
import { SearchOverlayProvider } from "@/hooks/useSearchOverlay";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteHeaderFallback } from "@/components/layout/SiteHeaderFallback";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageTransition } from "@/components/layout/PageTransition";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";
import "./globals.css";

// --font-display / --font-ui: Archivo para todo — titulares en 900/800,
// nombres de producto en 700, cuerpo en 400. Self-hosted por Next.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

// --font-mono: IBM Plex Mono para navegación, etiquetas, precios y CTAs.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Emer · Marcas de streetwear",
    template: "%s · Emer",
  },
  description:
    "Descubre streetwear de marcas emergentes y compra sin recorrer decenas de webs: el catálogo de todas ellas en un único sitio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // --font-ui se resuelve a --font-display en globals.css: una sola familia
  // sans (Archivo) para chrome y titulares.
  return (
    <html lang="es" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        {/* AuthProvider envuelve todo el árbol: el header y los controles de
            admin comparten una única sesión en vez de resolverla cada uno. */}
        <AuthProvider>
          <SearchOverlayProvider>
            <RouteProgressBar />
            {/* SiteHeader es client (depende de la URL para el género) — el
                Suspense evita que eso bloquee el prerender estático del
                resto de la página; el fallback tiene su misma altura. */}
            <Suspense fallback={<SiteHeaderFallback />}>
              <SiteHeader />
            </Suspense>
            {/* El header es fixed (handoff): el main arranca bajo su altura. */}
            <main className="pt-header">
              <PageTransition>{children}</PageTransition>
            </main>
            <SiteFooter />
          </SearchOverlayProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
