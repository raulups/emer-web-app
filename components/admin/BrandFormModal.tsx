"use client";

import type { Brand } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { BrandForm } from "./BrandForm";

interface BrandFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (brandName: string) => void;
  /** Marca a editar; sin ella el panel crea una nueva. */
  brand?: Brand;
}

/** Panel de alta/edición de marca: el diálogo del sistema con el formulario dentro. */
export function BrandFormModal({ open, onClose, onSaved, brand }: BrandFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={brand ? `Editar ${brand.name}` : "Crear marca"}
      size="lg"
    >
      {/* `key`: al pasar de una marca a otra (o de editar a crear) el
          formulario debe remontarse, o conservaría en su estado los valores
          de la marca anterior. */}
      <BrandForm key={brand?.id ?? "new"} brand={brand} onSaved={onSaved} onCancel={onClose} />
    </Modal>
  );
}
