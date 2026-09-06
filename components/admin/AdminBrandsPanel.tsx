"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Brand } from "@/lib/types";
import { brandTagLabels } from "@/lib/types";
import { formatDate, padCount } from "@/lib/utils/format";
import { useUser } from "@/hooks/useUser";
import { FadeInImage } from "@/components/ui/FadeInImage";
import { Toast } from "@/components/ui/Toast";
import { BrandFormModal } from "./BrandFormModal";

interface AdminBrandsPanelProps {
  brands: Brand[];
}

/**
 * Listado de todas las marcas con edición en modal. Las filas llegan ya
 * ordenadas por prioridad de tag desde `getBrands`, así que el panel enseña
 * el mismo orden que verá el visitante — que es justo lo que se está
 * editando aquí.
 */
export function AdminBrandsPanel({ brands }: AdminBrandsPanelProps) {
  const { isAdmin, loading } = useUser();
  const router = useRouter();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Solo cuando la sesión ya se ha resuelto: durante `loading` el usuario
    // todavía no se conoce y redirigir echaría también a los admins.
    if (!loading && !isAdmin) router.replace("/");
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <p className="mono px-page py-section text-text-3">
        {loading ? "Comprobando sesión…" : "Redirigiendo…"}
      </p>
    );
  }

  function handleSaved(brandName: string) {
    setEditing(null);
    setCreating(false);
    setToast(`Marca “${brandName}” guardada`);
    // El endpoint ya ha revalidado /admin/brands y /; esto hace que este
    // árbol vuelva a pedir el listado ya actualizado.
    router.refresh();
  }

  return (
    <div>
      <section className="grid items-end gap-[clamp(14px,3vw,28px)] border-b border-line px-page pb-bar pt-[clamp(34px,6vw,54px)] lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="mono mb-3 hidden tracking-mono-wide text-text-3 md:block">
            Administración
          </p>
          <h1 className="display text-fluid-view tracking-display">Marcas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="mono text-text-3">{padCount(brands.length)} en total</span>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mono flex min-h-hit items-center gap-2.5 bg-ink px-4 text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover"
          >
            <span aria-hidden>+</span> Crear marca
          </button>
          <Link
            href="/"
            className="mono flex min-h-hit items-center border border-line px-4 text-ink transition-colors duration-fast ease-zara hover:border-ink"
          >
            Volver al sitio
          </Link>
        </div>
      </section>

      <ul>
        {brands.map((brand) => {
          const labels = brandTagLabels(brand.tags);
          const image = brand.img ?? brand.logo;
          return (
            <li
              key={brand.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-page py-4"
            >
              <span className="relative block h-14 w-14 shrink-0 overflow-hidden border border-line bg-subtle">
                {image ? (
                  <FadeInImage
                    src={image}
                    alt=""
                    aria-hidden
                    fill
                    sizes="56px"
                    className="object-cover"
                    showPlaceholder={false}
                  />
                ) : null}
              </span>

              <span className="min-w-0 flex-1 basis-40">
                <span className="block text-fluid-name font-bold uppercase tracking-name text-ink">
                  {brand.name}
                </span>
                <span className="mono block truncate text-text-3">
                  {brand.url ?? "Sin web"}
                </span>
              </span>

              <span className="flex shrink-0 flex-wrap gap-1.5">
                {labels.length > 0 ? (
                  labels.map((label) => (
                    <span
                      key={label}
                      className="mono border border-ink px-2 py-0.5 text-ink"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="mono border border-line px-2 py-0.5 text-text-3">
                    Sin tags
                  </span>
                )}
              </span>

              <span className="mono hidden shrink-0 text-text-3 md:block">
                {formatDate(brand.created_at)}
              </span>

              <button
                type="button"
                onClick={() => setEditing(brand)}
                className="mono ml-auto flex min-h-hit shrink-0 items-center border border-ink px-4 text-ink transition-colors duration-fast ease-zara hover:bg-ink hover:text-fg-inverse"
              >
                Editar
              </button>
            </li>
          );
        })}
      </ul>

      <BrandFormModal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        brand={editing ?? undefined}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
