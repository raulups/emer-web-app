import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de Supabase para Server Components / fetch inicial en servidor.
 *
 * Reutiliza las mismas variables públicas que el cliente de navegador:
 * esta app es de solo lectura, así que la anon key es suficiente (las
 * policies RLS son las que autorizan el SELECT público). No se usa
 * service_role/secret key en ningún punto del proyecto.
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
