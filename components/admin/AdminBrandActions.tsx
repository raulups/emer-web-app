"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Toast } from "@/components/ui/Toast";

/**
 * Formulario de alta cargado bajo demanda: solo lo usan las cuentas admin, y
 * aun para ellas solo al abrir el panel, así que no tiene por qué pesar en la
 * carga inicial del listado de marcas que ve todo el mundo.
 */
const CreateBrandModal = dynamic(
  () => import("./CreateBrandModal").then((m) => m.CreateBrandModal),
  { ssr: false },
);

/**
 * Punto de entrada de administración en el índice de marcas.
 *
 * Se monta siempre (también para visitantes anónimos) y no pinta nada salvo
 * que `isAdmin` sea cierto — así la página sigue siendo un Server Component
 * estático y no hace falta leer cookies en el servidor para renderizarla.
 * Ocultar el botón es cosmético: quien autoriza de verdad es
 * `POST /api/brands`, que revalida el token y relee el rol en la base.
 */
export function AdminBrandActions() {
  const { isAdmin } = useUser();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  if (!isAdmin) return null;

  return (
    <>
      {/* Bloque negro: el CTA del handoff. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mono flex min-h-hit shrink-0 items-center gap-2.5 bg-ink px-4 text-fg-inverse transition-colors duration-fast ease-zara hover:bg-fg-hover"
      >
        <span aria-hidden>+</span> Crear marca
      </button>

      <CreateBrandModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(brandName) => {
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
