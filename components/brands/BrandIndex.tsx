"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Brand } from "@/lib/types";
import { brandTagLabels } from "@/lib/types";
import { domainOf, padCount } from "@/lib/utils/format";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { useGenderQueryString } from "@/hooks/useGenderQueryString";

interface BrandIndexProps {
  brands: Brand[];
}

/**
 * Carrusel horizontal del índice. Cada marca es una tarjeta con su foto a
 * sangre (b/n → color al hover), un velo oscuro para el contraste, el
 * nombre gigante delineado en papel que se rellena al hover, el número y la
 * meta en mono, y el logo pequeño en la esquina superior derecha.
 *
 * La rueda del ratón se traduce a scroll horizontal mientras el cursor está
 * sobre el carrusel; en los extremos vuelve a hacer scroll de página para
 * no dejar al usuario atrapado.
 *
 * Sin `scroll-snap`: con snap activo, cada incremento programático de
 * `scrollLeft` que no caía cerca de un punto de encaje volvía a encajarse
 * en la tarjeta actual, y la rueda parecía no hacer nada (comprobado en el
 * inspector: `defaultPrevented: true` y `scrollLeft` sin cambiar).
 */
export function BrandIndex({ brands }: BrandIndexProps) {
  const genderQuery = useGenderQueryString();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setEdges({
      start: track.scrollLeft > 1,
      end: max > 1 && track.scrollLeft < max - 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function handleWheel(event: WheelEvent) {
      // Un trackpad ya manda deltaX: solo se traduce el gesto vertical.
      if (event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const max = track!.scrollWidth - track!.clientWidth;
      if (max <= 0) return;
      const atStart = track!.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = track!.scrollLeft >= max - 1 && event.deltaY > 0;
      if (atStart || atEnd) return;
      event.preventDefault();
      track!.scrollLeft += event.deltaY;
    }

    // `passive: false` es obligatorio para poder llamar a preventDefault en
    // un evento wheel; React lo registra pasivo por defecto.
    track.addEventListener("wheel", handleWheel, { passive: false });
    track.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    updateEdges();

    return () => {
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, brands.length]);

  if (brands.length === 0) {
    return (
      <p className="mono flex flex-1 items-center px-page py-6 text-text-3">
        Todavía no hay marcas en el índice
      </p>
    );
  }

  return (
    <div className="relative flex min-w-0 flex-1">
      <div
        ref={trackRef}
        className="no-scrollbar flex w-full min-w-0 flex-1 items-center gap-2 overflow-x-auto overflow-y-hidden px-page py-4"
        role="list"
        aria-label="Índice de marcas"
      >
        {brands.map((brand, index) => {
          const meta = brandTagLabels(brand.tags).join(" · ") || domainOf(brand.url);
          return (
            <Link
              key={brand.id}
              role="listitem"
              href={`/brands/${brand.id}${genderQuery}`}
              className="group relative flex h-[clamp(260px,46vh,440px)] w-[clamp(300px,64vw,720px)] shrink-0 flex-col justify-end overflow-hidden bg-ink p-[clamp(14px,2vw,22px)] text-fg-inverse"
              aria-label={`${brand.name}: ver colección`}
            >
              <div className="photo-zoom absolute inset-0 group-hover:scale-[1.05]">
                {brand.img ? (
                  <FadeInImage
                    src={brand.img}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(min-width: 1024px) 720px, 64vw"
                    className="object-cover"
                    showPlaceholder={false}
                  />
                ) : (
                  <div className="placeholder-dark absolute inset-0" aria-hidden />
                )}
              </div>
              {/* Velo: contraste AA del texto en papel sobre cualquier foto. */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/30 to-ink/35"
              />

              <span className="mono absolute left-[clamp(14px,2vw,22px)] top-[clamp(14px,2vw,22px)] hidden text-paper/85 md:block">
                {padCount(index + 1)}
              </span>

              {brand.logo ? (
                <span className="absolute right-[clamp(14px,2vw,22px)] top-[clamp(14px,2vw,22px)] block h-9 w-9 overflow-hidden bg-paper/90 sm:h-10 sm:w-10">
                  <FadeInImage
                    src={brand.logo}
                    alt=""
                    aria-hidden
                    fill
                    sizes="40px"
                    className="object-contain p-1"
                    showPlaceholder={false}
                  />
                </span>
              ) : null}

              <span className="text-outline-inverse display relative max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(34px,5.4vw,80px)] leading-[0.9] tracking-display">
                {brand.name}
              </span>
              {meta ? (
                <span className="mono relative mt-2 hidden text-paper/85 md:block">{meta}</span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Degradados de borde: señalan que hay más contenido a cada lado. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-paper to-paper/0 transition-opacity duration-base ease-zara ${
          edges.start ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-paper to-paper/0 transition-opacity duration-base ease-zara ${
          edges.end ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
