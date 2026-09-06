"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@/hooks/useUser";

/**
 * El panel de acceso se carga solo cuando hace falta: la inmensa mayoría de
 * las visitas no inician sesión, y así su formulario no viaja en el bundle
 * inicial de todas las páginas.
 */
const LoginModal = dynamic(
  () => import("./LoginModal").then((m) => m.LoginModal),
  { ssr: false },
);

/**
 * Control de sesión del header. Sin sesión, un enlace mono "Acceder"; con
 * sesión, el email del usuario y "Salir".
 *
 * Mientras `loading` es `true` se reserva el hueco con un bloque vacío en
 * vez de no pintar nada: el header es fijo y un cambio de ancho ahí
 * desplazaría la navegación de al lado en cuanto se resuelve la sesión.
 */
export function AuthButton() {
  const { user, loading } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    // Diferido igual que en el AuthProvider: este componente vive en el
    // header de todas las páginas y no debe arrastrar supabase-js al bundle
    // inicial solo por tener un botón de salir.
    const { supabase } = await import("@/lib/supabase/client");
    await supabase.auth.signOut();
    setSigningOut(false);
  }

  if (loading) {
    return <span aria-hidden className="block h-5 w-16" />;
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="link-quiet flex min-h-hit items-center text-ink"
        >
          Acceder
        </button>
        <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span
        className="hidden max-w-[14rem] truncate text-text-3 lg:block"
        title={user.email ?? undefined}
      >
        {user.email}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="link-quiet flex min-h-hit items-center text-ink disabled:opacity-40"
      >
        {signingOut ? "Saliendo…" : "Salir"}
      </button>
    </div>
  );
}
