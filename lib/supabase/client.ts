"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de Supabase para Client Components.
 *
 * Solo lectura: se usa exclusivamente la anon key pública, apoyada en las
 * policies RLS de `brands`, `categories` y `products` que permiten SELECT
 * público. Nunca importar aquí la service_role key.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
