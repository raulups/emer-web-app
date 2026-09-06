import { PageContainer } from "@/components/layout/PageContainer";
import { BrandHeaderSkeleton } from "@/components/brands/BrandHeaderSkeleton";
import { ProductsExplorerSkeleton } from "@/components/products/ProductsExplorerSkeleton";

export default function Loading() {
  return (
    <div>
      <BrandHeaderSkeleton />
      <PageContainer>
        <ProductsExplorerSkeleton />
      </PageContainer>
    </div>
  );
}
