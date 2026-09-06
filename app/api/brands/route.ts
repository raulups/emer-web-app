import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  BRAND_RETURNING,
  authorizeAdmin,
  jsonError,
  parseBrandForm,
  uploadBrandImages,
} from "@/lib/supabase/brand-admin";

/**
 * Crea una marca: sube sus imágenes al bucket `brands` de Storage e inserta
 * la fila. Solo para cuentas con `profiles.role = 'admin'`.
 *
 * La autorización, la validación del formulario y la subida viven en
 * `lib/supabase/brand-admin.ts`, compartidas con el PATCH de edición: son
 * exactamente las mismas reglas y no deben poder divergir.
 *
 * El cuerpo llega como multipart/form-data (no JSON) porque incluye los
 * ficheros de imagen; `request.formData()` los entrega ya parseados.
 */
export async function POST(request: Request) {
  const auth = await authorizeAdmin();
  if (!auth.ok) return auth.response;
  const { supabaseAdmin } = auth;

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

  const { data: brand, error: insertError } = await supabaseAdmin
    .from("brands")
    .insert({
      name: fields.name,
      url: fields.url,
      color: fields.color,
      tags: fields.tags,
      img: uploaded.urls.img,
      logo: uploaded.urls.logo,
    })
    .select(BRAND_RETURNING)
    .single();

  if (insertError) {
    return jsonError(`No se ha podido guardar la marca: ${insertError.message}`, 500);
  }

  // El listado de marcas de `/` es estático: sin esto seguiría sirviendo la
  // versión cacheada sin la marca recién creada.
  revalidatePath("/");
  revalidatePath("/admin/brands");

  return NextResponse.json({ brand }, { status: 201 });
}
