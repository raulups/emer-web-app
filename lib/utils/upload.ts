import { slugify } from "./slug";

/** Tamaño máximo por imagen. El servidor lo aplica; el formulario lo avisa antes. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Extensión por defecto cuando el nombre del fichero no trae una utilizable. */
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/**
 * Extensión saneada del fichero original. Se filtra a `[a-z0-9]` y se
 * limita a 5 caracteres a propósito: el nombre viene del cliente y acaba
 * formando parte de una ruta de Storage, así que no puede colar puntos,
 * barras ni `..`.
 */
function fileExtension(fileName: string, mimeType: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase() ?? "";
  const clean = fromName.replace(/[^a-z0-9]/g, "").slice(0, 5);
  if (clean) return clean;
  return MIME_EXTENSIONS[mimeType] ?? "bin";
}

/**
 * Nombre determinista dentro del bucket: slug de la marca + sufijo del campo
 * + extensión original. Ej.: `dameapresparis_image.webp`.
 *
 * Que sea determinista es lo que hace que `upsert: true` sobrescriba en un
 * reintento en vez de dejar ficheros huérfanos acumulados.
 */
export function storageFilename(
  brandName: string,
  suffix: "image" | "logo",
  file: { name: string; type: string },
  fallbackId: string,
): string {
  // Un nombre compuesto solo de símbolos deja el slug vacío; en ese caso se
  // usa un id aleatorio para no generar ficheros llamados "_image.png" que
  // colisionarían entre marcas distintas.
  const base = slugify(brandName) || fallbackId;
  return `${base}_${suffix}.${fileExtension(file.name, file.type)}`;
}
