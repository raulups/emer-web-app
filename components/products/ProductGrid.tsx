import type { ProductListItem } from "@/lib/types";
import {
  DEFAULT_GRID_DENSITY,
  GRID_DENSITY_CLASSES,
  type GridDensity,
} from "@/lib/types/grid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: ProductListItem[];
  showBrand?: boolean;
  density?: GridDensity;
}

export function ProductGrid({
  products,
  showBrand = false,
  density = DEFAULT_GRID_DENSITY,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Sin resultados"
        description="Ningún producto coincide con los filtros seleccionados. Prueba a ajustarlos."
      />
    );
  }

  return (
    <div className={`grid gap-x-4 gap-y-12 ${GRID_DENSITY_CLASSES[density]}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          showBrand={showBrand}
        />
      ))}
    </div>
  );
}
