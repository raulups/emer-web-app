import { formatPrice } from "@/lib/utils/format";

interface PriceTagProps {
  currentPrice: number | null;
  originalPrice: number | null;
  currency: string | null;
  isOnSale: boolean | null;
  size?: "sm" | "lg";
}

/**
 * Precio en mono (el handoff reserva IBM Plex Mono para todo lo numérico) y,
 * si hay oferta, el original tachado al lado en gris secundario. Sin color
 * de acento: la rebaja se lee por el tachado y por el chip REBAJA.
 */
export function PriceTag({
  currentPrice,
  originalPrice,
  currency,
  isOnSale,
  size = "sm",
}: PriceTagProps) {
  const showOriginal = isOnSale && originalPrice && originalPrice > (currentPrice ?? 0);
  const textSize = size === "lg" ? "text-[16px]" : "text-ui";

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono">
      <span className={`${textSize} text-ink`}>{formatPrice(currentPrice, currency)}</span>
      {showOriginal ? (
        <span className="text-ui text-text-3 line-through">
          {formatPrice(originalPrice, currency)}
        </span>
      ) : null}
    </div>
  );
}
