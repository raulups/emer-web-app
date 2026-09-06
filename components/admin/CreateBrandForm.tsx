"use client";

import { useRef, useState } from "react";
import { MAX_IMAGE_BYTES } from "@/lib/utils/upload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileField } from "@/components/ui/FileField";

interface CreateBrandFormProps {
  /** Recibe el nombre de la marca creada, para el aviso de confirmación. */
  onCreated: (brandName: string) => void;
  onCancel: () => void;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * Alta de marca. Envía `multipart/form-data` a `POST /api/brands` (no JSON,
 * porque el cuerpo lleva los ficheros de imagen) y deja que el servidor
 * suba a Storage con la service_role key: el navegador nunca ve esa clave ni
 * habla con Storage directamente.
 *
 * La validación de aquí es solo comodidad —avisar antes de gastar una
 * subida—; la que manda es la del endpoint, que repite nombre, tamaño, tipo,
 * URL y color.
 */
export function CreateBrandForm({ onCreated, onCancel }: CreateBrandFormProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [color, setColor] = useState("");
  const [isEmergent, setIsEmergent] = useState(false);
  const [img, setImg] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const hasFiles = Boolean(img || logo);

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
    body.set("is_emergent", String(isEmergent));
    if (img) body.set("img", img);
    if (logo) body.set("logo", logo);

    setSubmitting(true);
    try {
      // Sin cabecera Content-Type a propósito: el navegador la pone él con
      // el `boundary` del multipart, que no podemos calcular a mano.
      const response = await fetch("/api/brands", { method: "POST", body });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error ?? "No se ha podido crear la marca.");
        return;
      }

      onCreated(trimmedName);
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

      <FileField label="Imagen" value={img} onChange={setImg} maxBytes={MAX_IMAGE_BYTES} />

      <FileField
        label="Logo"
        value={logo}
        onChange={setLogo}
        maxBytes={MAX_IMAGE_BYTES}
        aspect="aspect-square"
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

      <div>
        <span className="mono block text-text-3">Marca emergente</span>
        <button
          type="button"
          onClick={() => setIsEmergent((value) => !value)}
          aria-pressed={isEmergent}
          className={`mono mt-2 flex min-h-hit items-center justify-between gap-2.5 border px-3 transition-colors duration-fast ease-zara sm:min-w-[160px] ${
            isEmergent
              ? "border-ink bg-ink text-fg-inverse"
              : "border-line text-ink hover:border-ink"
          }`}
        >
          <span>{isEmergent ? "Sí" : "No"}</span>
          <span aria-hidden>{isEmergent ? "●" : ""}</span>
        </button>
      </div>

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
            : "Crear marca"}
          {!submitting ? <span aria-hidden>→</span> : null}
        </Button>
      </div>
    </form>
  );
}
