import type { Brand } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { BrandCard } from "./BrandCard";

interface BrandGridProps {
  brands: Brand[];
}

export function BrandGrid({ brands }: BrandGridProps) {
  if (brands.length === 0) {
    return (
      <EmptyState
        title="Sin marcas"
        description="Todavía no hay marcas cargadas en el catálogo."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {brands.map((brand, index) => (
        <BrandCard key={brand.id} brand={brand} index={index} />
      ))}
    </div>
  );
}
