"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { brandTagLabels } from "@/lib/types";
import { DUR, EASE, EASE_OUT, PANEL_ENTER, staggerDelay } from "@/lib/motion";
import { domainOf, padCount } from "@/lib/utils/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { Portal } from "@/components/ui/Portal";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])';

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Buscador de marcas a pantalla completa: fondo negro al 95% con blur,
 * input gigante centrado y, debajo, los resultados apareciendo con fade +
 * deslizamiento (Framer, tokens --dur-base/--ease, escalonados). El
 * filtrado va con el mismo debounce que la búsqueda por texto del catálogo.
 * `Enter` abre la primera coincidencia, `Escape` cierra.
 *
 * Solo busca MARCAS (nombre y dominio); la búsqueda de productos sigue en
 * los filtros. La lista se pide al abrir por primera vez, desde el cliente,
 * con el mismo `import()` diferido del cliente de Supabase.
 *
 * Se monta en un Portal: el header tiene backdrop-filter y, sin él,
 * `fixed; inset: 0` se quedaba dentro de sus 54px.
 */
export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const genderQuery = useGenderQueryString();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 150);
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || brands !== null) return;
    let active = true;

    (async () => {
      try {
        const [{ getBrands }, { supabase }] = await Promise.all([
          import("@/lib/supabase/queries"),
          import("@/lib/supabase/client"),
        ]);
        const list = await getBrands(supabase);
        if (active) setBrands(list);
      } catch {
        if (active) setLoadError(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [open, brands]);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    setQuery("");
    const focus = setTimeout(() => inputRef.current?.focus(), 50);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focus);
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus?.();
    };
  }, [open]);

  const results = useMemo(() => {
    if (!brands) return [];
    const q = normalize(debouncedQuery);
    if (!q) return brands;
    return brands.filter(
      (brand) =>
        normalize(brand.name).includes(q) || normalize(domainOf(brand.url)).includes(q),
    );
  }, [brands, debouncedQuery]);

  function openBrand(brand: Brand) {
    onClose();
    router.push(`/brands/${brand.id}${genderQuery}`);
  }

  const hasQuery = normalize(debouncedQuery).length > 0;
  const hint = loadError
    ? "No se han podido cargar las marcas"
    : brands === null
      ? "Cargando marcas…"
      : hasQuery
        ? results.length === 0
          ? "Sin coincidencias"
          : `${padCount(results.length)} ${results.length === 1 ? "marca" : "marcas"} · Enter abre la primera`
        : `${padCount(brands.length)} marcas · escribe para filtrar`;

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Buscar marca"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DUR.fast, ease: EASE_OUT } }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="fixed inset-0 z-[120] flex flex-col bg-ink/95 text-fg-inverse backdrop-blur-[8px]"
          >
            <div className="mono flex shrink-0 items-center justify-between gap-4 border-b border-paper/20 px-page py-[15px] text-paper/70">
              <span>Buscar marca</span>
              <button
                type="button"
                onClick={onClose}
                className="link-quiet flex min-h-hit items-center gap-2.5 text-fg-inverse"
              >
                Cerrar <span aria-hidden>✕</span>
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -PANEL_ENTER.y }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.base, ease: EASE }}
              // `no-scrollbar`: el scroll sigue funcionando, pero sin la
              // barra nativa del sistema encima del overlay negro.
              className="no-scrollbar mx-auto flex w-full max-w-5xl flex-1 flex-col gap-[clamp(24px,5vw,44px)] overflow-y-auto px-page py-[clamp(24px,6vw,60px)]"
            >
              <div className="shrink-0 pt-[8vh]">
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    const first = results[0];
                    if (event.key === "Enter" && first) openBrand(first);
                  }}
                  placeholder="Escribe una marca…"
                  aria-label="Nombre de la marca"
                  autoComplete="off"
                  // Color, fondo, caret y placeholder explícitos: el input vive
                  // sobre el overlay negro y no puede depender de heredar nada
                  // (la regla base de globals.css pinta los inputs en --fg
                  // sobre --bg). Placeholder al 60% de blanco: 4.6:1.
                  // El `text-fluid-search` (hasta 104px) es para lo que se
                  // escribe; el placeholder baja a escala de interfaz con su
                  // tracking mono, que a 104px era ilegible.
                  className="display w-full border-0 border-b border-paper/25 bg-transparent pb-3.5 text-center text-fluid-search tracking-display text-fg-inverse caret-paper placeholder:text-[clamp(14px,3.5vw,20px)] placeholder:tracking-mono-wide placeholder:text-paper/60 focus:bg-transparent focus:text-fg-inverse focus:outline-none focus-visible:border-paper"
                />
                <p className="mono pt-4 text-center text-paper/70" aria-live="polite">
                  {hint}
                </p>
              </div>

              <ul className="flex flex-col" aria-label="Resultados">
                <AnimatePresence initial={false} mode="popLayout">
                  {results.map((brand, index) => {
                    const domain = domainOf(brand.url);
                    const logo = brand.logo ?? brand.img;
                    return (
                      <motion.li
                        key={brand.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6, transition: { duration: DUR.fast, ease: EASE_OUT } }}
                        transition={{ duration: DUR.base, ease: EASE, delay: staggerDelay(index, 0.03, 0.24) }}
                      >
                        <button
                          type="button"
                          onClick={() => openBrand(brand)}
                          className="link-quiet flex w-full items-center gap-5 border-t border-paper/15 py-[clamp(12px,2.5vw,18px)] text-left text-fg-inverse"
                        >
                          <span className="relative block h-12 w-12 shrink-0 overflow-hidden bg-paper/90">
                            {logo ? (
                              <FadeInImage
                                src={logo}
                                alt=""
                                aria-hidden
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                                showPlaceholder={false}
                              />
                            ) : null}
                          </span>
                          {/* Prioridad de espacio: el nombre manda. En móvil
                              la meta baja a su propia línea para que el nombre
                              disponga del ancho completo y nunca se trunque ni
                              se comprima (envuelve si hace falta); desde `sm`
                              vuelven a la misma fila, donde el dominio ocupa
                              lo que sobre y se corta, y el tipo es lo primero
                              que desaparece al estrechar. */}
                          <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                            <span className="display break-words text-fluid-result tracking-[-0.05em]">
                              {brand.name}
                            </span>
                            <span className="mono flex min-w-0 shrink items-baseline gap-2 text-paper/70 sm:justify-end sm:text-right">
                              {brandTagLabels(brand.tags).length > 0 ? (
                                <span className="hidden shrink-0 sm:inline">
                                  {brandTagLabels(brand.tags).join(" · ")}
                                </span>
                              ) : null}
                              {domain ? <span className="min-w-0 truncate">{domain}</span> : null}
                            </span>
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              <AnimatePresence>
                {brands && hasQuery && results.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.base, ease: EASE }}
                    className="display border-t border-paper/15 py-10 text-center text-[clamp(20px,5vw,26px)] font-extrabold tracking-[-0.03em] text-fg-inverse"
                  >
                    No se encontraron marcas
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}
