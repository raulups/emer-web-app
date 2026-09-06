"use client";

import { useRef, useState } from "react";
import type { Brand, BrandTag } from "@/lib/types";
import { BRAND_TAGS } from "@/lib/types";
import { MAX_IMAGE_BYTES } from "@/lib/utils/upload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileField } from "@/components/ui/FileField";

interface BrandFormProps {
  /** Marca a editar. Sin ella, el formulario crea una nueva. */
  brand?: Brand;
  /** Recibe el nombre de la marca guardada, para el aviso de confirmación. */
  onSaved: (brandName: string) => void;
  onCancel: () => void;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * Alta y edición de marca en el mismo formulario: los campos, las reglas y
 * el tratamiento de imágenes son idénticos, solo cambia el verbo HTTP
 * (`POST /api/brands` o `PATCH /api/brands/[brandId]`).
 *
 * Envía `multipart/form-data` (no JSON, porque el cuerpo lleva ficheros) y
 * deja que el servidor suba a Storage con la service_role key: el navegador
 * nunca ve esa clave ni habla con Storage directamente.
 *
 * En edición, las imágenes actuales se muestran como vista previa pero NO
 * se reenvían: solo viajan los ficheros que el admin reemplace, y el
 * endpoint conserva las URLs existentes para los que no lleguen.
 *
 * La validación de aquí es solo comodidad —avisar antes de gastar una
 * subida—; la que manda es la del endpoint, que repite nombre, tamaño,
 * tipo, URL, color y tags.
 */
export function BrandForm({ brand, onSaved, onCancel }: BrandFormProps) {
  const isEdit = Boolean(brand);
  const [name, setName] = useState(brand?.name ?? "");
  const [url, setUrl] = useState(brand?.url ?? "");
  const [color, setColor] = useState(brand?.color ?? "");
  const [tags, setTags] = useState<BrandTag[]>(brand?.tags ?? []);
  const [img, setImg] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const hasFiles = Boolean(img || logo);

  function toggleTag(tag: BrandTag) {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre de la marca es obligatorio.");
      nameRef.current?.focus();
      return;
    }
    if (color && !HEX_COLOR.test(color)) {
      setError("El color debe ser un hexadecimal de 6 dígitos (#RRGGBB).");
      return;
    }

    const body = new FormData();
    body.set("name", trimmedName);
    body.set("url", url.trim());
    body.set("color", color);
    // Un campo `tags` por opción marcada; el servidor los lee con `getAll`.
    for (const tag of tags) body.append("tags", tag);
    if (img) body.set("img", img);
    if (logo) body.set("logo", logo);

    setSubmitting(true);
    try {
      // Sin cabecera Content-Type a propósito: el navegador la pone él con
      // el `boundary` del multipart, que no podemos calcular a mano.
      const response = await fetch(
        brand ? `/api/brands/${brand.id}` : "/api/brands",
        { method: brand ? "PATCH" : "POST", body },
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "No se ha podido guardar la marca.");
        return;
      }

      onSaved(trimmedName);
    } catch {
      setError("No se ha podido conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="brand-name" className="mono block text-text-3">
          Nombre <span aria-hidden>*</span>
        </label>
        <Input
          ref={nameRef}
          id="brand-name"
          required
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2"
        />
      </div>

      <div>
        <label htmlFor="brand-url" className="mono block text-text-3">
          Sitio web
        </label>
        <Input
          id="brand-url"
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="mt-2"
        />
      </div>

      <FileField
        label="Imagen"
        value={img}
        onChange={setImg}
        maxBytes={MAX_IMAGE_BYTES}
        initialPreviewUrl={brand?.img ?? null}
      />

      <FileField
        label="Logo"
        value={logo}
        onChange={setLogo}
        maxBytes={MAX_IMAGE_BYTES}
        aspect="aspect-square"
        initialPreviewUrl={brand?.logo ?? null}
      />

      <div>
        <label htmlFor="brand-color" className="mono block text-text-3">
          Color
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="brand-color"
            type="color"
            // El selector nativo siempre tiene un valor; el "sin color" lo
            // representa nuestro estado vacío, no el input.
            value={color || "#0a0a0a"}
            onChange={(event) => setColor(event.target.value)}
            aria-label="Selector de color de la marca"
            className="h-11 w-12 shrink-0 cursor-pointer border border-line bg-paper p-1"
          />
          <Input
            value={color}
            onChange={(event) => setColor(event.target.value)}
            placeholder="#0A0A0A"
            aria-label="Color en hexadecimal"
            maxLength={7}
            className="font-mono"
          />
          {color ? (
            <button
              type="button"
              onClick={() => setColor("")}
              className="mono link-quiet shrink-0 text-ink"
            >
              Quitar
            </button>
          ) : null}
        </div>
      </div>

      <fieldset>
        <legend className="mono block text-text-3">Tags</legend>
        {/* Selección múltiple. El orden es el de prioridad de catálogo
            (popular → emergente → novedad), y se recuerda debajo porque de
            estos tags depende el orden en que se ven las marcas. */}
        <div className="mt-2 flex flex-wrap gap-2">
          {BRAND_TAGS.map((tag) => {
            const active = tags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                aria-pressed={active}
                className={`mono flex min-h-hit items-center gap-2.5 border px-3 transition-colors duration-fast ease-zara ${
                  active
                    ? "border-ink bg-ink text-fg-inverse"
                    : "border-line text-ink hover:border-ink"
                }`}
              >
                <span>{tag.label}</span>
                <span aria-hidden>{active ? "●" : ""}</span>
              </button>
            );
          })}
        </div>
        <p className="mono mt-2 text-text-3">
          Ordena el catálogo: popular va primero, luego emergente y novedad.
        </p>
      </fieldset>

      {error ? (
        <p role="alert" className="border-l border-ink pl-3 text-ui text-ink">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
        <Button type="button" variant="link" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="solid" disabled={submitting} className="flex-1">
          {submitting
            ? hasFiles
              ? "Subiendo imágenes…"
              : "Guardando…"
            : isEdit
              ? "Guardar cambios"
              : "Crear marca"}
          {!submitting ? <span aria-hidden>→</span> : null}
        </Button>
      </div>
    </form>
  );
}
