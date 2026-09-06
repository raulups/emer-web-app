"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente de Supabase para Client Components.
 *
 * Usa `createBrowserClient` de `@supabase/ssr` (y no `createClient` de
 * supabase-js) porque la sesión tiene que viajar en **cookies**, no en
 * localStorage: así el mismo login que hace el navegador lo puede leer el
 * servidor —`createServerSupabaseAuthClient` en `./server.ts`— para
 * autorizar `POST /api/brands`. Sin cookies compartidas, el endpoint de
 * admin no tendría forma de saber quién llama.
 *
 * Sigue siendo un cliente de **anon key**: las lecturas del catálogo se
 * apoyan en las policies RLS de SELECT público de `brands`/`categories`/
 * `products`, y la lectura de `profiles` en `profiles_select_own` (cada
 * usuario solo ve su propia fila). La service_role key nunca entra aquí:
 * vive solo en `./admin.ts`, que es server-only.
 */
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
