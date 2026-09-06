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

/**
 * Contador a dos dígitos ("04", "12"), el formato de todos los números del
 * handoff. Por encima de 99 se deja tal cual.
 */
export function padCount(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Dominio legible de una URL ("scffrs.com"), sin protocolo ni `www.`. Es lo
 * que el handoff muestra como meta de marca junto al nombre. Devuelve null
 * si la URL no se puede parsear.
 */
export function domainOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url.includes("://") ? url : `https://${url}`).hostname;
    return host.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}
