"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Barra de progreso fina (estilo NProgress) para cambios de RUTA reales
 * (distinto pathname) — `/`, `/products`, `/brands/[id]`, `/products/[id]`.
 *
 * Deliberadamente hecha a mano en vez de con una librería tipo
 * next-nprogress-bar: así se controla con precisión que SOLO reaccione a
 * clicks en `<a>` internos que cambian de pathname, no a los `router.push`
 * de solo query params que ya disparan nuestros propios filtros (esos ya
 * tienen su overlay/skeleton — ver ProductsExplorer). Un click-listener
 * genérico no distingue eso, así que se implementa el detector aquí mismo.
 *
 * - Arranca al hacer click en un link interno que apunta a otro pathname.
 * - Avanza no lineal (pasos cada vez más pequeños), se frena cerca del 90%.
 * - Al detectar que `usePathname()` cambió (contenido nuevo montado),
 *   termina al 100% y se desvanece en ~200ms.
 */
export function RouteProgressBar() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Solo cambios de RUTA: si el pathname es el mismo (p.ej. solo cambia
      // el query string), no es una navegación de página — no hay nada que
      // señalizar aquí, ese caso ya lo cubre el overlay de filtros.
      if (url.pathname === window.location.pathname) return;

      start();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
    };
  }, []);

  function start() {
    if (fadeRef.current) clearTimeout(fadeRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    setVisible(true);
    setProgress(10);
    tickRef.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        // Avance no lineal: cada tick avanza una fracción de lo que queda,
        // así que se ralentiza visiblemente al acercarse al 90%.
        return current + (90 - current) * 0.15;
      });
    }, 100);
  }

  function finish() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    setProgress(100);
    // Se desvanece en --dur-base con --ease (nunca una curva elástica).
    fadeRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[2px] w-full"
    >
      <div
        className="h-full bg-fg"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition:
            "width var(--dur-fast) var(--ease), opacity var(--dur-base) var(--ease)",
        }}
      />
    </div>
  );
}
