import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductsExplorerSkeleton } from "@/components/products/ProductsExplorerSkeleton";

export default function Loading() {
  return (
    <PageContainer>
      <div className="mb-10 border-b border-line pb-8">
        <Skeleton className="h-10 w-56 sm:h-14" />
      </div>
      <ProductsExplorerSkeleton />
    </PageContainer>
  );
}
