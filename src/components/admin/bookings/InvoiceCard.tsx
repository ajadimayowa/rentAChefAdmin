import { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { convertToThousand, formatDate } from '../../../utils/format';
import { ApiError } from '../../../config/api';
import { ProcurementDocumentActions } from '../../procurement/ProcurementDocumentActions';
import { createBookingInvoice, deleteBookingInvoice, type InvoiceRecord } from '../../../services/admin/invoiceServices';
import { AddBookingDocumentModal } from './AddProcurementModal';

/** Invoices attached to a booking, newest first: view, download, delete unpaid. */
export function InvoiceCard({
  records,
  onDeleted,
  isQuotation




}: {records: InvoiceRecord[];onDeleted: (id: string) => void;isQuotation?: boolean;}) {
  const [pendingDelete, setPendingDelete] = useState<InvoiceRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const remove = async (record: InvoiceRecord) => {
    setDeletingId(record.id);
    try {
      await deleteBookingInvoice(record.id);
      onDeleted(record.id);
      toast.success('Invoice deleted.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete this invoice.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Invoices"
        description={
        isQuotation ?
        'This is a quotation booking — send the client their invoice once you have reviewed the request.' :
        'Invoice documents sent to the client. Unpaid ones can be deleted.'
        }
        action={<FileText className="h-4 w-4 text-ink-300" />} />

      {records.length === 0 ?
      <p className="px-5 py-6 text-sm text-ink-500">No invoice added yet.</p> :

      <ul className="divide-y divide-ink-100">
          {records.map((record) =>
        <li key={record.id} className="space-y-3 px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge tone={record.isPaid ? 'success' : 'warning'}>{record.isPaid ? 'Paid' : 'Awaiting payment'}</Badge>
                  <span className="text-xs text-ink-400">{formatDate(record.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-heading text-base font-semibold text-ink-950">{convertToThousand(record.amount)}</span>
                  {record.isPaid ? null :
              <button
                type="button"
                onClick={() => setPendingDelete(record)}
                disabled={deletingId === record.id}
                aria-label="Delete invoice"
                title="Delete invoice"
                className="ml-1 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40">

                      <Trash2 className="h-4 w-4" />
                    </button>
              }
                </div>
              </div>
              {record.documentUrl ? <ProcurementDocumentActions url={record.documentUrl} name={record.documentName} /> : null}
              {record.isPaid && record.paymentReference ?
          <p className="text-xs text-ink-500">Paid · Ref {record.paymentReference}</p> :
          null}
            </li>
        )}
        </ul>
      }

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete invoice?"
        message={pendingDelete ? `This removes the ${convertToThousand(pendingDelete.amount)} invoice from the booking.` : ''}
        onConfirm={() => pendingDelete && remove(pendingDelete)}
        onClose={() => setPendingDelete(null)} />

    </Card>);

}

export function AddInvoiceModal({
  open,
  onClose,
  bookingId,
  onCreated




}: {open: boolean;onClose: () => void;bookingId: string;onCreated: (record: InvoiceRecord) => void;}) {
  return (
    <AddBookingDocumentModal
      open={open}
      onClose={onClose}
      copy={{
        title: 'Add invoice',
        description: 'Upload the invoice PDF and the amount the client should pay. The client is notified and can view or download it.',
        fileLabel: 'Invoice PDF',
        amountLabel: 'Invoice amount',
        submitLabel: 'Add invoice',
        missingFileMessage: 'Upload the invoice PDF.',
        successMessage: 'Invoice added — the client has been notified.',
        failureMessage: 'Could not add the invoice.'
      }}
      onSubmit={async (file, amount) => onCreated(await createBookingInvoice(bookingId, file, amount))} />);


}
