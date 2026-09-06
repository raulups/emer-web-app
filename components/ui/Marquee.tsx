"use client";

import { useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";

const ITEMS = ["New arrivals", "Nueva temporada", "Marcas emergentes", "Venta directa de marca"];

/** Segundos que tarda una copia en recorrer su propio ancho (handoff: 26s). */
const LOOP_SECONDS = 26;

/**
 * Marquee (1.3 del handoff): barra negra con dos copias idénticas del texto
 * desplazándose en bucle. Se implementa con `useAnimationFrame` sobre un
 * motion value en vez de un keyframe infinito porque así se puede PAUSAR
 * sin salto —al hover o foco, que es el control de pausa que exige la
 * accesibilidad para cualquier movimiento continuo— y se anula del todo con
 * `prefers-reduced-motion`.
 */
export function Marquee() {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);

  useAnimationFrame((_, delta) => {
    if (paused || reduceMotion) return;
    const track = trackRef.current;
    if (!track) return;
    // Una copia = la mitad del ancho total; al superarla, se vuelve a 0 y
    // la segunda copia queda exactamente donde estaba la primera.
    const half = track.scrollWidth / 2;
    if (half === 0) return;
    const speed = half / (LOOP_SECONDS * 1000);
    const next = x.get() - speed * delta;
    x.set(next <= -half ? next + half : next);
  });

  return (
    <div
      className="overflow-hidden bg-ink py-3.5 text-fg-inverse"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      // Focusable para que el usuario de teclado pueda detenerlo.
      tabIndex={0}
      role="marquee"
      aria-label="Novedades del catálogo. Se detiene al pasar el ratón o al enfocar."
    >
      <motion.div ref={trackRef} style={{ x }} className="flex w-max">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="mono flex gap-9 whitespace-nowrap pr-9 tracking-mono-wide"
          >
            {[...ITEMS, ...ITEMS].map((item, index) => (
              <span key={`${copy}-${index}`} className="flex gap-9">
                <span>{item}</span>
                <span aria-hidden>•</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
