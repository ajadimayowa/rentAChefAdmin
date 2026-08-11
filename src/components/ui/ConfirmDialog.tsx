import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose







}: {open: boolean;title: string;message: string;confirmLabel?: string;onConfirm: () => void;onClose: () => void;}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="flex gap-4 px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm leading-relaxed text-ink-600">{message}</p>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}>
          
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>);

}