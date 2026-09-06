"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface FadeInImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /**
   * Permite al consumidor controlar la visibilidad además de la carga
   * (p.ej. el crossfade de hover de la card, donde hay dos imágenes
   * apiladas). La imagen solo se ve si está cargada Y visible.
   */
  visible?: boolean;
  /** Placeholder de carga detrás de la imagen (off para capas de hover). */
  showPlaceholder?: boolean;
}

/**
 * Imagen que aparece con un fade de opacidad 0→1 en --dur-base cuando
 * termina de descargar, sustituyendo al placeholder de esa imagen concreta
 * (fade simple, deliberadamente no un blur-up).
 *
 * Es `next/image` con la optimización activa (ver next.config.js): el
 * `sizes` que pase cada consumidor tiene que describir el ancho REAL que
 * ocupa la imagen en cada breakpoint, porque de él sale la resolución que
 * se pide. Un `sizes` mayor que el hueco solo desperdicia bytes; uno menor
 * produce la imagen estirada y borrosa que se quiere evitar. Las imágenes
 * protagonistas (galería del detalle, banners) pasan `quality={85}`; las
 * del grid se quedan en el 75 por defecto.
 */
export function FadeInImage({
  visible = true,
  showPlaceholder = true,
  className = "",
  // `alt` se extrae y se pasa explícito (aunque `ImageProps` ya lo exige)
  // porque jsx-a11y no puede verlo dentro del spread.
  alt,
  ...imageProps
}: FadeInImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {showPlaceholder && !loaded ? (
        <div aria-hidden className="absolute inset-0 animate-pulse bg-subtle" />
      ) : null}
      <Image
        {...imageProps}
        alt={alt}
        // `onError` también marca como cargada: si la imagen falla, no
        // debe quedarse un placeholder pulsando para siempre.
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`transition-opacity duration-base ease-zara ${
          loaded && visible ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </>
  );
}
