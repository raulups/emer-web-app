import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/**
 * Fallback de <Suspense> para ProductsExplorer y `loading.tsx` de las rutas
 * que lo usan: misma forma que el sidebar + barra de resultados + rejilla
 * reales, para que el layout no salte al llegar los datos.
 */
export function ProductsExplorerSkeleton() {
  return (
    <div className="grid lg:grid-cols-[268px_minmax(0,1fr)]">
      <div className="hidden border-r border-line lg:block">
        <div className="border-b border-line px-5 py-4">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-6 px-5 py-5">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div>
        <div className="flex min-h-[52px] items-center justify-between border-b border-line px-[clamp(14px,3.5vw,24px)]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-40" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
