import { Skeleton } from "@/components/ui/Skeleton";
import { ProductsExplorerSkeleton } from "@/components/products/ProductsExplorerSkeleton";

export default function Loading() {
  return (
    <div>
      <section className="grid items-end gap-[clamp(14px,3vw,28px)] border-b border-line px-page pb-bar pt-[clamp(34px,6vw,54px)] lg:grid-cols-[minmax(0,1fr)_auto]">
        <Skeleton className="h-[clamp(68px,18vw,208px)] w-2/3" />
        <Skeleton className="h-4 w-48" />
      </section>
      <ProductsExplorerSkeleton />
    </div>
  );
}
