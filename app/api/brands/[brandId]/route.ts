import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/types/database";
import {
  BRAND_RETURNING,
  authorizeAdmin,
  jsonError,
  parseBrandForm,
  uploadBrandImages,
} from "@/lib/supabase/brand-admin";

interface RouteContext {
  params: { brandId: string };
}

/**
 * Edita una marca existente. Mismas reglas que la creación —autorización,
 * validación y subida son las funciones compartidas de
 * `lib/supabase/brand-admin.ts`—, con una diferencia: las imágenes son
 * opcionales.
 *
 * Si no llega fichero nuevo para `img`/`logo`, se OMITE ese campo del
 * update en lugar de escribir `null`: el formulario de edición no reenvía
 * las imágenes actuales (son URLs, no ficheros), así que mandarlas a null
 * borraría la foto de la marca cada vez que se corrige una errata.
 */
export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await authorizeAdmin();
  if (!auth.ok) return auth.response;
  const { supabaseAdmin } = auth;

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("brands")
    .select("id, name, img, logo")
    .eq("id", params.brandId)
    .maybeSingle();

  if (fetchError) {
    return jsonError(`No se ha podido leer la marca: ${fetchError.message}`, 500);
  }
  if (!existing) {
    return jsonError("La marca no existe.", 404);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("El cuerpo de la petición debe ser multipart/form-data.");
  }

  const parsed = parseBrandForm(formData);
  if (!parsed.ok) return parsed.response;
  const { fields, files } = parsed;

  const uploaded = await uploadBrandImages(supabaseAdmin, fields.name, files);
  if (!uploaded.ok) return uploaded.response;

  const patch: Database["public"]["Tables"]["brands"]["Update"] = {
    name: fields.name,
    url: fields.url,
    color: fields.color,
    tags: fields.tags,
  };
  // Solo se tocan las imágenes que se han reemplazado de verdad.
  if (uploaded.urls.img) patch.img = uploaded.urls.img;
  if (uploaded.urls.logo) patch.logo = uploaded.urls.logo;

  const { data: brand, error: updateError } = await supabaseAdmin
    .from("brands")
    .update(patch)
    .eq("id", params.brandId)
    .select(BRAND_RETURNING)
    .single();

  if (updateError) {
    return jsonError(`No se ha podido actualizar la marca: ${updateError.message}`, 500);
  }

  revalidatePath("/");
  revalidatePath("/admin/brands");
  revalidatePath(`/brands/${params.brandId}`);

  return NextResponse.json({ brand });
}
