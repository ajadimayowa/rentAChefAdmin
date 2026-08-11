import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const sizes = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

export function Modal({ open, onClose, title, description, size = 'lg', children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-ink-950/50 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden="true" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`relative my-6 w-full ${sizes[size]} rounded-2xl bg-white shadow-2xl`}>
          
            <div className="flex items-start justify-between gap-4 border-b border-ink-200 px-6 py-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-ink-950">{title}</h2>
                {description ?
              <p className="mt-0.5 text-sm text-ink-500">{description}</p> :
              null}
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900">
              
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div> :
      null}
    </AnimatePresence>,
    document.body
  );
}

export function ModalFooter({ children }: {children: React.ReactNode;}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-200 bg-ink-50/60 px-6 py-4">
      {children}
    </div>);

}