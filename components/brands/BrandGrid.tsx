import type { Brand } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { BrandCard } from "./BrandCard";

interface BrandGridProps {
  brands: Brand[];
}

/**
 * Bento asimétrico de marcas (1.5 del handoff), generalizado a N marcas: el
 * prototipo tiene exactamente tres —una fila completa y una fila partida
 * 68/32—, así que aquí ese patrón se repite en grupos de tres. Un grupo
 * incompleto de dos ocupa una fila partida; uno de una, la fila completa.
 */
export function BrandGrid({ brands }: BrandGridProps) {
  if (brands.length === 0) {
    return (
      <EmptyState
        title="Sin marcas"
        description="Todavía no hay marcas cargadas en el catálogo."
      />
    );
  }

  const groups: Brand[][] = [];
  for (let i = 0; i < brands.length; i += 3) {
    groups.push(brands.slice(i, i + 3));
  }

  return (
    <section aria-label="Marcas">
      {groups.map((group, groupIndex) => {
        const base = groupIndex * 3;
        const [full, wide, narrow] = group;

        if (group.length === 3 && full && wide && narrow) {
          return (
            <div key={full.id}>
              <BrandCard brand={full} index={base} variant="full" />
              <div className="grid border-b border-line md:grid-cols-[68fr_32fr]">
                <BrandCard brand={wide} index={base + 1} variant="wide" />
                <BrandCard brand={narrow} index={base + 2} variant="narrow" />
              </div>
            </div>
          );
        }

        if (group.length === 2 && full && wide) {
          return (
            <div key={full.id} className="grid border-b border-line md:grid-cols-[68fr_32fr]">
              <BrandCard brand={full} index={base} variant="wide" />
              <BrandCard brand={wide} index={base + 1} variant="narrow" />
            </div>
          );
        }

        return full ? <BrandCard key={full.id} brand={full} index={base} variant="full" /> : null;
      })}
    </section>
  );
}
