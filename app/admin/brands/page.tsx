import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBrands } from "@/lib/supabase/queries";
import { AdminBrandsPanel } from "@/components/admin/AdminBrandsPanel";

export const metadata: Metadata = { title: "Gestionar marcas", robots: { index: false } };

// Siempre fresca: es un panel de edición, servir una versión cacheada haría
// que los cambios recién guardados parecieran no haberse aplicado.
export const dynamic = "force-dynamic";

/**
 * Panel de administración de marcas. El listado se sirve desde el servidor
 * (lectura pública, misma query que el catálogo), y el control de acceso lo
 * hace `AdminBrandsPanel` en cliente contra `useUser`.
 *
 * Esa comprobación es de INTERFAZ: evita enseñar el panel a quien no debe,
 * pero no protege datos —aquí no hay ninguno que no sea ya público— y lo
 * que de verdad autoriza cada cambio es el endpoint, que revalida el token
 * y relee el rol con la service_role key.
 */
export default async function AdminBrandsPage() {
  const brands = await getBrands(createServerSupabaseClient());

  return <AdminBrandsPanel brands={brands} />;
}
