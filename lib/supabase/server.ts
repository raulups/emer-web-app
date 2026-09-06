import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de Supabase para el fetch de catálogo en Server Components.
 *
 * Deliberadamente **sin cookies**: no lee sesión, así que no marca la ruta
 * como dinámica y `/` puede seguir prerenderizándose estática. El catálogo
 * es público y de solo lectura, y las policies RLS de SELECT público son las
 * que autorizan la consulta — no hace falta saber quién mira.
 *
 * Envuelto en `cache()` de React: dentro de un mismo request (p.ej.
 * generateMetadata + el componente de página de un detalle) se reutiliza la
 * misma instancia en vez de crear una por llamada.
 */
export const createServerSupabaseClient = cache(function createServerSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
});

/**
 * Cliente de Supabase **con sesión**, para código de servidor que necesita
 * saber quién está autenticado (hoy: `app/api/brands/route.ts`).
 *
 * Lee las cookies de sesión que escribe el cliente de navegador
 * (`./client.ts`, también de `@supabase/ssr`) — es el puente entre el login
 * que ocurre en el navegador y la autorización que ocurre en el servidor.
 *
 * A diferencia del de arriba, NO se cachea con `cache()`: la librería exige
 * una instancia nueva por request, porque las cabeceras anti-caché que
 * acompañan a un refresco de token solo se emiten en la primera escritura de
 * cookies de cada cliente.
 *
 * `setAll` va en try/catch porque en un Server Component las cookies son de
 * solo lectura y `cookies().set()` lanza; en un Route Handler (nuestro caso)
 * sí funciona, y ahí es donde importa que un refresco de token se persista.
 */
export function createServerSupabaseAuthClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Contexto de solo lectura (Server Component): el refresco de
          // sesión lo persistirá el navegador en su próxima llamada.
        }
      },
    },
  });
}
