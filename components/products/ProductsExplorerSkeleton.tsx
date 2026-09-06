import { ProductGridSkeleton } from "@/components/ui/Skeleton";

/**
 * Fallback de <Suspense> para ProductsExplorer y `loading.tsx` de las rutas
 * que lo usan: misma forma que la toolbar de filtros + grid reales, para
 * que el layout no salte al llegar los datos.
 */
export function ProductsExplorerSkeleton() {
  return (
    <div>
      <div className="h-20 animate-pulse border-b border-line bg-subtle" />
      <div className="mt-6">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
