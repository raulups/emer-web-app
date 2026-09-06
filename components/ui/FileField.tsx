"use client";

import { useEffect, useId, useRef, useState } from "react";

interface FileFieldProps {
  label: string;
  /** Fichero elegido, controlado por el formulario padre. */
  value: File | null;
  onChange: (file: File | null) => void;
  /** Tamaño máximo en bytes; el servidor aplica el mismo límite. */
  maxBytes: number;
  /** Proporción del recuadro de vista previa. */
  aspect?: string;
}

/**
 * Campo de imagen con vista previa inmediata.
 *
 * El `<input type="file">` nativo se oculta visualmente (no con `hidden`,
 * que lo sacaría del orden de tabulación) y se dispara desde un `<label>`,
 * porque su widget por defecto no se puede estilar. El `:focus-visible`
 * global sigue marcando el campo al llegar por teclado gracias a
 * `peer-focus-visible`.
 *
 * La URL del `createObjectURL` se revoca en la limpieza del efecto: sin eso,
 * cada cambio de selección deja el fichero anterior retenido en memoria.
 */
export function FileField({
  label,
  value,
  onChange,
  maxBytes,
  aspect = "aspect-[4/5]",
}: FileFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const maxMb = Math.round(maxBytes / 1024 / 1024);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function reject(message: string) {
    // Vaciar también el input nativo al rechazar, no solo el estado: si no,
    // volver a elegir ese mismo fichero (ya corregido fuera) no dispararía
    // `change` y el campo se quedaría atascado con el error puesto.
    setError(message);
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  }

  function handleSelect(file: File | null) {
    if (!file) {
      setError(null);
      onChange(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject("El archivo debe ser una imagen.");
      return;
    }
    if (file.size > maxBytes) {
      reject(`La imagen supera el máximo de ${maxMb} MB.`);
      return;
    }
    setError(null);
    onChange(file);
  }

  function clearSelection() {
    if (inputRef.current) inputRef.current.value = "";
    handleSelect(null);
  }

  return (
    <div>
      <span className="mono block text-text-3">{label}</span>

      <div className="mt-3 flex items-start gap-4">
        <div className={`${aspect} w-24 shrink-0 overflow-hidden border border-line bg-subtle`}>
          {previewUrl ? (
            // Vista previa local de un blob: `next/image` no aporta nada
            // sobre un object URL y exigiría desactivar la optimización.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Vista previa de ${label.toLowerCase()}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="placeholder-light block h-full w-full" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            onChange={(event) => handleSelect(event.target.files?.[0] ?? null)}
            className="peer sr-only"
          />
          <label
            htmlFor={inputId}
            className="mono inline-flex min-h-hit cursor-pointer items-center border border-ink px-4 py-2 text-ink transition-colors duration-fast ease-zara hover:bg-ink hover:text-fg-inverse peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg"
          >
            {value ? "Cambiar" : "Elegir imagen"}
          </label>

          {value ? (
            <div className="mt-3 flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate font-mono text-ui text-text-3">
                {value.name}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="mono link-quiet shrink-0 text-ink"
              >
                Quitar
              </button>
            </div>
          ) : (
            <p className="mono mt-3 text-text-3">Opcional · máx. {maxMb} MB</p>
          )}

          {error ? (
            <p role="alert" className="mt-2 border-l border-ink pl-3 text-ui text-ink">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
