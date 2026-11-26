import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import {
  createBookingProcurement,
  PROCUREMENT_PDF_MAX_BYTES,
  type ProcurementRecord } from
'../../../services/admin/procurementServices';
import { ApiError } from '../../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const MAX_MB = PROCUREMENT_PDF_MAX_BYTES / (1024 * 1024);

/** Keeps only digits and one decimal point with at most 2 decimal places. */
const sanitizeAmount = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
};

const formatSize = (bytes: number) =>
bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export interface BookingDocumentCopy {
  title: string;
  description: string;
  /** e.g. "Procurement PDF" */
  fileLabel: string;
  /** e.g. "Total amount" */
  amountLabel: string;
  submitLabel: string;
  missingFileMessage: string;
  successMessage: string;
  failureMessage: string;
}

/** Upload a PDF plus the amount the client pays — used for procurement and invoices. */
export function AddBookingDocumentModal({
  open,
  onClose,
  copy,
  onSubmit




}: {open: boolean;onClose: () => void;copy: BookingDocumentCopy;onSubmit: (file: File, amount: string) => Promise<void>;}) {
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{file?: string;amount?: string;}>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setFile(null);
    setAmount('');
    setErrors({});
    onClose();
  };

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    const isPdf = picked.type === 'application/pdf' || /\.pdf$/i.test(picked.name);
    if (!isPdf) {
      setErrors((e) => ({ ...e, file: 'Only PDF files are allowed.' }));
      return;
    }
    if (picked.size > PROCUREMENT_PDF_MAX_BYTES) {
      setErrors((e) => ({ ...e, file: `The PDF must be ${MAX_MB} MB or smaller.` }));
      return;
    }
    setFile(picked);
    setErrors((e) => ({ ...e, file: undefined }));
  };

  const numericAmount = Number(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!file) nextErrors.file = copy.missingFileMessage;
    if (!amount || !(numericAmount > 0)) nextErrors.amount = 'Enter the total amount.';
    setErrors(nextErrors);
    if (!file || nextErrors.amount) return;

    setSubmitting(true);
    try {
      await onSubmit(file, amount);
      toast.success(copy.successMessage);
      close();
    } catch (err) {
      toast.error(errorMessage(err, copy.failureMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={copy.title}
      description={copy.description}
      size="md">

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5 p-6">
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-800">{copy.fileLabel}</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = ''; // allow re-picking the same file
              }} />

            {file ?
            <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{file.name}</p>
                  <p className="text-xs text-ink-500">{formatSize(file.size)}</p>
                </div>
                <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove file"
                className="rounded-lg p-1.5 text-ink-400 hover:bg-white hover:text-ink-700">

                  <X className="h-4 w-4" />
                </button>
              </div> :

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors hover:border-buttons hover:bg-buttons/5 ${
              errors.file ? 'border-red-300' : 'border-ink-200'}`
              }>

                <Upload className="h-5 w-5 text-ink-400" />
                <span className="text-sm font-medium text-ink-800">Click to upload or drag a PDF here</span>
                <span className="text-xs text-ink-500">PDF only, up to {MAX_MB} MB</span>
              </button>
            }
            {errors.file ? <p className="mt-1.5 text-xs text-red-600">{errors.file}</p> : null}
          </div>

          <div>
            <label htmlFor="document-amount" className="mb-1.5 block text-sm font-medium text-ink-800">
              {copy.amountLabel}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">₦</span>
              <input
                id="document-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={(e) => {
                  setAmount(sanitizeAmount(e.target.value));
                  setErrors((er) => ({ ...er, amount: undefined }));
                }}
                placeholder="0.00"
                className={`w-full rounded-lg border bg-white py-2 pl-7 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25 ${
                errors.amount ? 'border-red-300' : 'border-ink-200'}`
                } />

            </div>
            {errors.amount ?
            <p className="mt-1.5 text-xs text-red-600">{errors.amount}</p> :
            numericAmount > 0 ?
            <p className="mt-1.5 text-xs text-ink-500">
                The client will be asked to pay ₦{numericAmount.toLocaleString('en-NG', { maximumFractionDigits: 2 })}.
              </p> :
            null}
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Uploading…' : copy.submitLabel}
          </Button>
        </ModalFooter>
      </form>
    </Modal>);

}

export function AddProcurementModal({
  open,
  onClose,
  bookingId,
  onCreated



}: {open: boolean;onClose: () => void;bookingId: string;onCreated: (record: ProcurementRecord) => void;}) {
  return (
    <AddBookingDocumentModal
      open={open}
      onClose={onClose}
      copy={{
        title: 'Add procurement',
        description: 'Upload the procurement PDF and the total the client should pay. The client is notified to view it and make payment.',
        fileLabel: 'Procurement PDF',
        amountLabel: 'Total amount',
        submitLabel: 'Add procurement',
        missingFileMessage: 'Upload the procurement PDF.',
        successMessage: 'Procurement added — the client has been notified.',
        failureMessage: 'Could not add procurement.'
      }}
      onSubmit={async (file, amount) => {
        const res = await createBookingProcurement(bookingId, file, amount);
        onCreated(res.payload);
      }} />);


}
