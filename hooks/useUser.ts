"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** `true` hasta que se resuelve la sesión inicial (y su perfil, si hay). */
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Estado de sesión compartido por toda la app. Se monta una sola vez en
 * `app/layout.tsx` para que el header y los controles de admin lean el mismo
 * usuario sin pedirlo cada uno por su cuenta.
 *
 * `isAdmin` es únicamente una señal de INTERFAZ: decide si se pinta el botón
 * de crear marca, nada más. La autorización de verdad vive en el servidor
 * —`app/api/brands/route.ts` revalida el token contra Supabase y relee
 * `profiles.role` con la service_role key—, así que manipular este valor
 * desde el navegador no da acceso a nada.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      // `import()` diferido, mismo criterio que el scroll infinito y el
      // drawer de filtros: supabase-js pesa ~70 kB y aquí se necesita justo
      // después de hidratar, no para pintar la primera pantalla. Mientras
      // llega, `loading` sigue en true y el header reserva el hueco.
      const { supabase } = await import("@/lib/supabase/client");
      if (!active) return;

      // El callback es deliberadamente síncrono: `onAuthStateChange` se
      // ejecuta dentro del lock interno de supabase-js, y llamar ahí a otro
      // método `await`-eado del cliente (como el select de `profiles`) puede
      // bloquearlo. Se guarda la sesión y el perfil se pide en el efecto de
      // abajo, ya fuera del callback.
      const { data: subscription } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          setSession(nextSession);
          setLoadingSession(false);
        },
      );
      unsubscribe = () => subscription.subscription.unsubscribe();

      // Después de suscribirse, para no perder un cambio de sesión que
      // ocurriera mientras se resolvía esta promesa.
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setLoadingSession(false);
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    let active = true;
    setLoadingProfile(true);

    (async () => {
      const { supabase } = await import("@/lib/supabase/client");
      // `profiles_select_own` limita esto a la fila del propio usuario;
      // `maybeSingle` evita que un perfil aún no creado por el trigger se
      // convierta en un error ruidoso.
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;
      // Un fallo aquí (grant o policy que falte, tabla sin crear) dejaría
      // `isAdmin` en false sin ninguna pista visible; se avisa en consola
      // para que no se confunda con "el rol no está asignado".
      if (error) {
        console.warn("[useUser] No se ha podido leer profiles:", error.message);
      }
      setProfile(data ?? null);
      setLoadingProfile(false);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      profile,
      isAdmin: profile?.role === "admin",
      loading: loadingSession || loadingProfile,
    }),
    [session, profile, loadingSession, loadingProfile],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

/** Devuelve `{ user, profile, isAdmin, loading }` del `AuthProvider`. */
export function useUser(): AuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useUser debe usarse dentro de <AuthProvider>.");
  }

  return context;
}
