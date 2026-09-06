"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = "login" | "signup";

/**
 * Acceso y alta de cuenta en el mismo panel: el enlace de abajo alterna
 * entre los dos modos sin navegar a otra página, así que el usuario no
 * pierde el sitio del catálogo en el que estaba.
 *
 * Toda cuenta nueva nace con rol `user` (lo fija el trigger
 * `on_auth_user_created`). El ascenso a `admin` es manual desde el SQL
 * Editor de Supabase — ver supabase/sql/auth_profiles.sql.
 */
export function LoginModal({ open, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  // Estado limpio en cada apertura: si se cerró con un error a medias, no
  // debe reaparecer la próxima vez.
  useEffect(() => {
    if (!open) return;
    setMode("login");
    setEmail("");
    setPassword("");
    setError(null);
    setNotice(null);
    setSubmitting(false);
    const focus = setTimeout(() => emailRef.current?.focus(), 0);
    return () => clearTimeout(focus);
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError("Introduce email y contraseña.");
      return;
    }

    setSubmitting(true);

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setSubmitting(false);

      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos."
            : signInError.message,
        );
        return;
      }
      // El AuthProvider se entera por `onAuthStateChange`; aquí solo cerramos.
      onClose();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Si el proyecto tiene la confirmación por email activada, `signUp` no
    // devuelve sesión: la cuenta existe pero aún no está autenticada. Hay que
    // decirlo, o parecería que el alta no ha hecho nada.
    if (!data.session) {
      setNotice("Cuenta creada. Revisa tu correo para confirmarla y vuelve a acceder.");
      setMode("login");
      setPassword("");
      return;
    }

    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === "login" ? "Acceder" : "Crear cuenta"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="auth-email" className="mono block text-text-3">
            Email
          </label>
          <Input
            ref={emailRef}
            id="auth-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="mono block text-text-3">
            Contraseña
          </label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2"
          />
          {mode === "signup" ? (
            <p className="mono mt-2 text-text-3">Mínimo 6 caracteres</p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="border-l border-ink pl-3 text-ui text-ink">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="border-l border-ink pl-3 text-ui text-ink">
            {notice}
          </p>
        ) : null}

        <Button type="submit" variant="solid" disabled={submitting} className="w-full">
          {submitting
            ? "Enviando…"
            : mode === "login"
              ? "Acceder"
              : "Crear cuenta"}
          <span aria-hidden>→</span>
        </Button>

        <p className="mono text-center text-text-3">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setNotice(null);
            }}
            className="link-quiet text-ink"
          >
            {mode === "login" ? "Crear cuenta" : "Acceder"}
          </button>
        </p>
      </form>
    </Modal>
  );
}
