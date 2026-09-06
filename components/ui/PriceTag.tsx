import { formatPrice } from "@/lib/utils/format";

interface PriceTagProps {
  currentPrice: number | null;
  originalPrice: number | null;
  currency: string | null;
  isOnSale: boolean | null;
  size?: "sm" | "lg";
}

/**
 * Precio actual y, si hay oferta, el original tachado al lado.
 *
 * Jerarquía del sistema: el precio va un punto por encima del nombre del
 * producto (14px) y en peso regular; el acento rojo aparece solo aquí y en
 * el chip REBAJA, nunca en otro sitio de la app.
 */
export function PriceTag({
  currentPrice,
  originalPrice,
  currency,
  isOnSale,
  size = "sm",
}: PriceTagProps) {
  const showOriginal = isOnSale && originalPrice && originalPrice > (currentPrice ?? 0);
  const textSize = size === "lg" ? "text-2xl" : "text-base";

  return (
    <div className="flex items-baseline gap-2">
      <span className={`${textSize} tracking-ui ${isOnSale ? "text-accent" : "text-ink"}`}>
        {formatPrice(currentPrice, currency)}
      </span>
      {showOriginal ? (
        <span className="text-ui tracking-ui text-muted-text line-through">
          {formatPrice(originalPrice, currency)}
        </span>
      ) : null}
    </div>
  );
}
