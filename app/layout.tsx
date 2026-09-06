import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteHeaderFallback } from "@/components/layout/SiteHeaderFallback";
import { PageTransition } from "@/components/layout/PageTransition";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";
import "./globals.css";

// --font-ui: todo el chrome de interfaz, un único peso (400) salvo el 300
// de nombres de producto largos. Self-hosted por Next.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-ui",
  display: "swap",
});

// --font-display: serif editorial, solo wordmark y titulares puntuales.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Catálogo de marcas",
    template: "%s · Catálogo de marcas",
  },
  description: "Explora marcas de ropa y su catálogo de productos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <RouteProgressBar />
        {/* SiteHeader es client (depende de la URL para el género) — el
            Suspense evita que eso bloquee el prerender estático del resto
            de la página; el fallback tiene su misma altura para no saltar. */}
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        {/* Sin padding aquí: lo aporta PageContainer en cada ruta, para que
            el hero de marca pueda ir a sangre completa (ver PageContainer). */}
        <main>
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
