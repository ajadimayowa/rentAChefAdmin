import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { createBookingProcurement, type ProcurementRecord } from '../../../services/admin/procurementServices';
import { ApiError } from '../../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

interface Row {
  title: string;
  description: string;
  amount: string;
}

const emptyRow = (): Row => ({ title: '', description: '', amount: '' });

export function AddProcurementModal({
  open,
  onClose,
  bookingId,
  onCreated



}: {open: boolean;onClose: () => void;bookingId: string;onCreated: (record: ProcurementRecord) => void;}) {
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setRows([emptyRow()]);
    onClose();
  };

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  };

  const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = rows.
    filter((r) => r.title.trim() && Number(r.amount) > 0).
    map((r) => ({
      title: r.title.trim(),
      description: r.description.trim() || undefined,
      amount: Number(r.amount)
    }));

    if (items.length === 0) {
      toast.error('Add at least one item with a title and amount.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBookingProcurement(bookingId, items);
      onCreated(res.payload);
      toast.success('Procurement added to booking.');
      close();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add procurement.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Add procurement" description="Record grocery/ingredient items and their cost for this booking." size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-3 p-6">
          {rows.map((row, i) =>
          <div key={i} className="flex items-start gap-2 rounded-lg border border-ink-200 p-3">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[2fr_2fr_1fr]">
                <input
                type="text"
                value={row.title}
                onChange={(e) => updateRow(i, { title: e.target.value })}
                placeholder="Item title"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

                <input
                type="text"
                value={row.description}
                onChange={(e) => updateRow(i, { description: e.target.value })}
                placeholder="Description (optional)"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

                <input
                type="number"
                min="0"
                step="any"
                value={row.amount}
                onChange={(e) => updateRow(i, { amount: e.target.value })}
                placeholder="Amount"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

              </div>
              <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              aria-label="Remove item"
              className="mt-1.5 shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-30">

                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setRows((prev) => [...prev, emptyRow()])}>

            Add item
          </Button>

          <div className="flex items-center justify-end gap-2 border-t border-ink-200 pt-3 text-sm">
            <span className="text-ink-500">Total</span>
            <span className="font-heading text-base font-semibold text-ink-950">
              ₦{total.toLocaleString()}
            </span>
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Add procurement'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>);

}
