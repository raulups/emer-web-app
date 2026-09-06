import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { supabaseUrl } from "./env";

/**
 * Cliente de Supabase con **service_role key**: salta RLS por completo.
 *
 * `import "server-only"` en la primera línea no es decorativo — hace que el
 * build falle si algún día este módulo acaba, aunque sea transitivamente, en
 * un Client Component. Hoy su único importador es `app/api/brands/route.ts`.
 *
 * Se usa para dos cosas que la anon key no puede hacer:
 *   1. Leer `profiles.role` de cualquier usuario (la policy solo deja leer la
 *      fila propia; aquí se comprueba el rol de quien llama al endpoint).
 *   2. Subir al bucket `brands` de Storage e insertar en `brands`, sin
 *      necesidad de abrir policies de escritura al público.
 *
 * La clave se lee dentro de la función, no en el módulo: así el error por
 * variable ausente aparece al llamar al endpoint, con un mensaje claro, en
 * vez de reventar la recolección de rutas del build.
 */
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY. Añádela a .env.local (sin prefijo NEXT_PUBLIC_, ver README).",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
