"use client";

import { useEffect, useRef } from "react";

/**
 * Observa un elemento "sentinel" y llama a `onIntersect` cuando entra en
 * viewport. Pensado para disparar la carga de la siguiente página de un
 * scroll infinito. Devuelve el ref a colocar en el elemento sentinel.
 */
export function useIntersectionObserver(
  onIntersect: () => void,
  options?: IntersectionObserverInit,
) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  const rootMargin = options?.rootMargin;
  const threshold = options?.threshold;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(target);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin, threshold]);

  return targetRef;
}
