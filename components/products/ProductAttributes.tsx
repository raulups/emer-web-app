import type { AttributeEntries } from "@/lib/types";

interface ProductAttributesProps {
  entries: AttributeEntries;
}

/** Lista clave-valor de `attributes` (jsonb), estilo ficha técnica. */
export function ProductAttributes({ entries }: ProductAttributesProps) {
  if (entries.length === 0) return null;

  return (
    <dl className="divide-y divide-line border-t border-line">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between gap-6 py-3 text-ui">
          <dt className="capitalize text-muted-text">{key.replace(/_/g, " ")}</dt>
          <dd className="text-right text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
