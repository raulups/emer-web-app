import type { ProductPriceHistoryEntry } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils/format";

interface PriceHistoryChartProps {
  history: ProductPriceHistoryEntry[];
}

const WIDTH = 600;
const HEIGHT = 160;
const PADDING_X = 8;
const PADDING_Y = 16;

/** Línea temporal simple de precio, sin dependencias de librería de gráficos. */
export function PriceHistoryChart({ history }: PriceHistoryChartProps) {
  if (history.length < 2) return null;

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const points = history.map((entry, index) => {
    const x =
      PADDING_X +
      (index / (history.length - 1)) * (WIDTH - PADDING_X * 2);
    const y =
      HEIGHT -
      PADDING_Y -
      ((entry.price - minPrice) / priceRange) * (HEIGHT - PADDING_Y * 2);
    return { x, y, entry };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const first = history[0];
  const last = history[history.length - 1];

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-5">
      <p className="mono tracking-mono-wide text-text-3">Histórico de precio</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full text-ink"
        role="img"
        aria-label="Histórico de precio del producto"
      >
        <path d={pathD} fill="none" stroke="currentColor" strokeWidth={1.5} />
        {points.map((p) => (
          <rect
            key={p.entry.id}
            x={p.x - 2.5}
            y={p.y - 2.5}
            width={5}
            height={5}
            fill="currentColor"
          >
            <title>
              {formatDate(p.entry.scraped_at)} — {formatPrice(p.entry.price, p.entry.currency)}
            </title>
          </rect>
        ))}
      </svg>
      {first && last ? (
        <div className="mono flex justify-between text-text-3">
          <span>{formatDate(first.scraped_at)}</span>
          <span>{formatDate(last.scraped_at)}</span>
        </div>
      ) : null}
    </div>
  );
}
