/**
 * Convierte un texto en un slug seguro para usar como nombre de fichero.
 *
 * `normalize("NFD")` separa cada letra acentuada en letra + tilde combinante,
 * y el rango \u0300-\u036f borra esas tildes: así "Damea Près" queda como
 * "damea pres" antes de colapsar lo que no sea alfanumérico. Sin este paso,
 * los acentos acabarían percent-encodeados en la URL pública de Storage.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 60);
}
