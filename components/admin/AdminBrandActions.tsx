"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Toast } from "@/components/ui/Toast";

/**
 * Formulario de alta cargado bajo demanda: solo lo usan las cuentas admin, y
 * aun para ellas solo al abrir el panel, así que no tiene por qué pesar en la
 * carga inicial del listado de marcas que ve todo el mundo.
 */
const BrandFormModal = dynamic(
  () => import("./BrandFormModal").then((m) => m.BrandFormModal),
  { ssr: false },
);

/**
 * Punto de entrada de administración en el índice de marcas: crear una
 * marca aquí mismo, o ir al panel completo para editarlas.
 *
 * Se monta siempre (también para visitantes anónimos) y no pinta nada salvo
 * que `isAdmin` sea cierto — así la página sigue siendo un Server Component
 * estático y no hace falta leer cookies en el servidor para renderizarla.
 * Ocultar los botones es cosmético: quien autoriza de verdad son los
 * endpoints, que revalidan el token y releen el rol en la base.
 */
export function AdminBrandActions() {
  const { isAdmin } = useUser();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  if (!isAdmin) return null;

  return (
    <>
      {/* Bloque negro = acción que crea; borde = navegación al panel. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mono flex min-h-hit shrink-0 items-center gap-2.5 bg-ink px-4 text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover"
      >
        <span aria-hidden>+</span> Crear marca
      </button>
      <Link
        href="/admin/brands"
        className="mono flex min-h-hit shrink-0 items-center border border-ink px-4 text-ink transition-colors duration-fast ease-zara hover:bg-ink hover:text-fg-inverse"
      >
        Gestionar marcas
      </Link>

      <BrandFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={(brandName) => {
          setOpen(false);
          setToast(`Marca “${brandName}” creada`);
          // El endpoint ya ha llamado a revalidatePath("/"); esto es lo que
          // hace que este árbol vuelva a pedir el listado ya revalidado.
          router.refresh();
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
