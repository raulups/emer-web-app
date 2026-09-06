/** Formatea un precio numérico con la moneda del producto (fallback EUR). */
export function formatPrice(
  price: number | null | undefined,
  currency?: string | null,
): string {
  if (price === null || price === undefined) return "—";
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: (currency ?? "EUR").trim() || "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

/** Formatea una fecha ISO a un formato corto legible (es-ES). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Calcula el % de descuento entre precio original y actual. */
export function discountPercent(
  currentPrice: number | null,
  originalPrice: number | null,
): number | null {
  if (!currentPrice || !originalPrice || originalPrice <= currentPrice) {
    return null;
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}
