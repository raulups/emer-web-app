"use client";

import { FadeInImage } from "@/components/ui/FadeInImage";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

/**
 * Galería del detalle: imágenes apiladas a sangre del contenedor (3/4,
 * sobre --muted-bg), separadas por líneas de 1px, y con borde derecho como
 * el hueco de imagen del modal del handoff. En desktop se ancla bajo el
 * header y scrollea por dentro si hay varias, dejando quieta la ficha.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="placeholder-light flex aspect-[3/4] w-full items-center justify-center border-line lg:border-r">
        <span className="mono text-text-3">Sin foto</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col divide-y divide-line border-line lg:border-r ${
        images.length > 1
          ? "lg:sticky lg:top-header lg:max-h-[calc(100vh-var(--header-h))] lg:self-start lg:overflow-y-auto"
          : ""
      }`}
    >
      {images.map((image, index) => (
        <div key={image} className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-subtle">
          <FadeInImage
            src={image}
            alt={index === 0 ? productName : ""}
            aria-hidden={index > 0}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
