import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseAuthClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { MAX_IMAGE_BYTES, storageFilename } from "@/lib/utils/upload";

const STORAGE_BUCKET = "brands";
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Crea una marca: sube sus imágenes al bucket `brands` de Storage e inserta
 * la fila. Solo para cuentas con `profiles.role = 'admin'`.
 *
 * La comprobación de rol se hace en DOS pasos deliberadamente separados:
 *
 *  1. `auth.getUser()` sobre el cliente de cookies. Se usa `getUser()` y no
 *     `getSession()` porque el primero revalida el JWT contra el servidor de
 *     Supabase; el segundo se limita a decodificar la cookie, que llega del
 *     navegador y por tanto no es de fiar en un control de acceso.
 *  2. El rol se relee de `profiles` con la service_role key, nunca del token
 *     ni de nada que haya enviado el cliente.
 *
 * El cuerpo llega como multipart/form-data (no JSON) porque incluye los
 * ficheros de imagen; `request.formData()` los entrega ya parseados.
 */
export async function POST(request: Request) {
  const supabaseAuth = createServerSupabaseAuthClient();
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return badRequest("Debes iniciar sesión.", 401);
  }

  const supabaseAdmin = createAdminSupabaseClient();

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return badRequest("No se ha podido verificar el perfil.", 500);
  }
  if (profile?.role !== "admin") {
    return badRequest("Solo un administrador puede crear marcas.", 403);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest("El cuerpo de la petición debe ser multipart/form-data.");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return badRequest("El nombre de la marca es obligatorio.");
  }

  const rawUrl = String(formData.get("url") ?? "").trim();
  if (rawUrl && !/^https?:\/\/\S+$/i.test(rawUrl)) {
    return badRequest("La URL debe empezar por http:// o https://");
  }

  const rawColor = String(formData.get("color") ?? "").trim();
  if (rawColor && !HEX_COLOR.test(rawColor)) {
    return badRequest("El color debe ser un hexadecimal de 6 dígitos (#RRGGBB).");
  }

  const isEmergent = formData.get("is_emergent") === "true";

  // Un campo de fichero vacío llega igualmente como File de 0 bytes, así que
  // no basta con comprobar que existe.
  const files: { field: "img" | "logo"; suffix: "image" | "logo"; file: File }[] = [];
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
      return badRequest(`"${file.name}" no es una imagen.`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return badRequest(
        `"${file.name}" supera el máximo de ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
      );
    }
  }

  // Todas las validaciones pasan antes de tocar Storage: así una petición
  // inválida no deja un fichero subido a medias sin fila que lo referencie.
  const publicUrls: { img: string | null; logo: string | null } = {
    img: null,
    logo: null,
  };
  const fallbackId = crypto.randomUUID();

  for (const { field, suffix, file } of files) {
    const filename = storageFilename(name, suffix, file, fallbackId);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filename, buffer, {
        contentType: file.type,
        // Reintentar con el mismo nombre de marca sobrescribe el fichero en
        // vez de duplicarlo, que es lo que queremos aquí.
        upsert: true,
      });

    if (uploadError) {
      return badRequest(
        `No se ha podido subir la imagen: ${uploadError.message}`,
        502,
      );
    }

    const { data } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filename);

    publicUrls[field] = data.publicUrl;
  }

  const { data: brand, error: insertError } = await supabaseAdmin
    .from("brands")
    .insert({
      name,
      url: rawUrl || null,
      img: publicUrls.img,
      logo: publicUrls.logo,
      color: rawColor || null,
      is_emergent: isEmergent,
    })
    .select("id, name, url, img, logo, color, is_emergent, created_at")
    .single();

  if (insertError) {
    return badRequest(`No se ha podido guardar la marca: ${insertError.message}`, 500);
  }

  // El listado de marcas de `/` es estático: sin esto seguiría sirviendo la
  // versión cacheada sin la marca recién creada.
  revalidatePath("/");

  return NextResponse.json({ brand }, { status: 201 });
}
