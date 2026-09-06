"use client";

import { Modal } from "@/components/ui/Modal";
import { CreateBrandForm } from "./CreateBrandForm";

interface CreateBrandModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (brandName: string) => void;
}

/** Panel de alta de marca: el diálogo del sistema con el formulario dentro. */
export function CreateBrandModal({ open, onClose, onCreated }: CreateBrandModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Crear marca" size="lg">
      <CreateBrandForm onCreated={onCreated} onCancel={onClose} />
    </Modal>
  );
}
