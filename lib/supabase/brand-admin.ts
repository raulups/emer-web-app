import "server-only";

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseAuthClient } from "./server";
import { createAdminSupabaseClient } from "./admin";
import type { Database } from "@/lib/types/database";
import { isBrandTag, type BrandTag } from "@/lib/types";
import { MAX_IMAGE_BYTES, storageFilename } from "@/lib/utils/upload";

export const STORAGE_BUCKET = "brands";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type AdminClient = SupabaseClient<Database>;

/** Campos de marca ya validados, listos para insertar o actualizar. */
export interface BrandFormFields {
  name: string;
  url: string | null;
  color: string | null;
  tags: BrandTag[];
}

export interface BrandFormFile {
  field: "img" | "logo";
  suffix: "image" | "logo";
  file: File;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Comprueba sesión y rol admin, en dos pasos deliberadamente separados:
 *
 *  1. `auth.getUser()` sobre el cliente de cookies. Se usa `getUser()` y no
 *     `getSession()` porque el primero revalida el JWT contra el servidor de
 *     Supabase; el segundo se limita a decodificar la cookie, que llega del
 *     navegador y por tanto no es de fiar en un control de acceso.
 *  2. El rol se relee de `profiles` con la service_role key, nunca del token
 *     ni de nada que haya enviado el cliente.
 *
 * Devuelve el cliente de service role si autoriza, o la respuesta de error.
 */
export async function authorizeAdmin(): Promise<
  { ok: true; supabaseAdmin: AdminClient } | { ok: false; response: NextResponse }
> {
  const supabaseAuth = createServerSupabaseAuthClient();
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return { ok: false, response: jsonError("Debes iniciar sesión.", 401) };
  }

  const supabaseAdmin = createAdminSupabaseClient();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, response: jsonError("No se ha podido verificar el perfil.", 500) };
  }
  if (profile?.role !== "admin") {
    return {
      ok: false,
      response: jsonError("Solo un administrador puede gestionar marcas.", 403),
    };
  }

  return { ok: true, supabaseAdmin };
}

/**
 * Valida el `multipart/form-data` del formulario de marca. Todo se comprueba
 * ANTES de tocar Storage, para que una petición inválida no deje ficheros
 * subidos sin fila que los referencie.
 */
export function parseBrandForm(
  formData: FormData,
): { ok: true; fields: BrandFormFields; files: BrandFormFile[] } | { ok: false; response: NextResponse } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, response: jsonError("El nombre de la marca es obligatorio.") };
  }

  const rawUrl = String(formData.get("url") ?? "").trim();
  if (rawUrl && !/^https?:\/\/\S+$/i.test(rawUrl)) {
    return { ok: false, response: jsonError("La URL debe empezar por http:// o https://") };
  }

  const rawColor = String(formData.get("color") ?? "").trim();
  if (rawColor && !HEX_COLOR.test(rawColor)) {
    return {
      ok: false,
      response: jsonError("El color debe ser un hexadecimal de 6 dígitos (#RRGGBB)."),
    };
  }

  // `getAll`: el formulario manda un campo `tags` por cada opción marcada.
  // Se validan contra el enum aquí además de en Postgres — un valor fuera de
  // `brand_tag` haría fallar el INSERT con un 22P02 poco legible.
  const rawTags = formData.getAll("tags").map((value) => String(value));
  const invalid = rawTags.find((tag) => !isBrandTag(tag));
  if (invalid !== undefined) {
    return { ok: false, response: jsonError(`Tag no válido: "${invalid}".`) };
  }
  const tags = [...new Set(rawTags)] as BrandTag[];

  // Un campo de fichero vacío llega igualmente como File de 0 bytes, así que
  // no basta con comprobar que existe.
  const files: BrandFormFile[] = [];
  for (const [field, suffix] of [
    ["img", "image"],
    ["logo", "logo"],
  ] as const) {
    const value = formData.get(field);
    if (value instanceof File && value.size > 0) {
      files.push({ field, suffix, file: value });
    }
  }

  for (const { file } of files) {
    if (!file.type.startsWith("image/")) {
      return { ok: false, response: jsonError(`"${file.name}" no es una imagen.`) };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        response: jsonError(
          `"${file.name}" supera el máximo de ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
        ),
      };
    }
  }

  return {
    ok: true,
    fields: { name, url: rawUrl || null, color: rawColor || null, tags },
    files,
  };
}

/**
 * Sube los ficheros recibidos al bucket `brands` y devuelve sus URLs
 * públicas. El nombre en el bucket es determinista (slug de la marca +
 * sufijo + extensión) y va con `upsert: true`, así que reeditar la misma
 * marca sobrescribe su fichero en vez de acumular duplicados.
 */
export async function uploadBrandImages(
  supabaseAdmin: AdminClient,
  brandName: string,
  files: BrandFormFile[],
): Promise<
  { ok: true; urls: { img: string | null; logo: string | null } } | { ok: false; response: NextResponse }
> {
  const urls: { img: string | null; logo: string | null } = { img: null, logo: null };
  const fallbackId = crypto.randomUUID();

  for (const { field, suffix, file } of files) {
    const filename = storageFilename(brandName, suffix, file, fallbackId);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return {
        ok: false,
        response: jsonError(`No se ha podido subir la imagen: ${uploadError.message}`, 502),
      };
    }

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
    urls[field] = data.publicUrl;
  }

  return { ok: true, urls };
}

/** Columnas que devuelven los endpoints tras crear o editar. */
export const BRAND_RETURNING = "id, name, url, img, logo, color, tags, created_at";
