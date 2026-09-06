import type { Metadata } from "next";
import { Suspense } from "react";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { AuthProvider } from "@/hooks/useUser";
import { SearchOverlayProvider } from "@/hooks/useSearchOverlay";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteHeaderFallback } from "@/components/layout/SiteHeaderFallback";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageTransition } from "@/components/layout/PageTransition";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";
import "./globals.css";

// --font-brand: "Owned" (font/owned.woff2, convertida desde el .ttf
// original, que se conserva como fuente de verdad).
//
// Variable propia y NO --font-display a propósito: se aplica solo al nombre
// EMER del titular de la home, vía `.brand-wordmark`. Todo lo demás
// —incluidos los otros titulares editoriales— sigue en Archivo.
const owned = localFont({
  src: "../font/owned.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-brand",
  display: "swap",
});

// --font-ui (y --font-display, que lo aliasa en globals.css): Archivo para
// titulares y todo el chrome de interfaz. Self-hosted por Next.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-ui",
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
  return (
    <html
      lang="es"
      className={`${owned.variable} ${archivo.variable} ${plexMono.variable}`}
    >
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
