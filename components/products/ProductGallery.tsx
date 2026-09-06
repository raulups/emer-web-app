"use client";

import { FadeInImage } from "@/components/ui/FadeInImage";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

/**
 * Galería del detalle de producto, al peso visual que Zara da a la
 * fotografía: imágenes apiladas verticalmente a sangre del contenedor y,
 * en desktop, con scroll propio dentro de la galería (la columna de info
 * queda pegada al lado sin moverse). En móvil se apilan sin más y scrollea
 * la página, que es lo natural ahí.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center bg-subtle text-ui uppercase tracking-ui text-muted-text">
        Sin imagen
      </div>
    );
  }

  return (
    <div
      className={
        images.length > 1
          ? "flex flex-col gap-2 lg:sticky lg:top-header lg:max-h-[calc(100vh-var(--header-h))] lg:self-start lg:overflow-y-auto"
          : "flex flex-col gap-2"
      }
    >
      {images.map((image, index) => (
        <div
          key={image}
          className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-subtle"
        >
          <FadeInImage
            src={image}
            alt={index === 0 ? productName : ""}
            aria-hidden={index > 0}
            fill
            sizes="(min-width: 1024px) 65vw, 100vw"
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
