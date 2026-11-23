import { useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import {
  deleteBookingProcurement,
  type ProcurementRecord } from
'../../../services/admin/procurementServices';
import { convertToThousand, formatDate } from '../../../utils/format';
import { ApiError } from '../../../config/api';
import { ProcurementDocumentActions } from '../../procurement/ProcurementDocumentActions';
import { ProcurementTotalsSummary } from '../../procurement/ProcurementTotalsSummary';

export function ProcurementCard({
  records,
  loading,
  onDeleted



}: {records: ProcurementRecord[];loading?: boolean;onDeleted: (id: string) => void;}) {
  const [pendingDelete, setPendingDelete] = useState<ProcurementRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const remove = async (record: ProcurementRecord) => {
    setDeletingId(record.id);
    try {
      await deleteBookingProcurement(record.id);
      onDeleted(record.id);
      toast.success('Procurement deleted.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete this procurement.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Procurement"
        description="The procurement price is the sum of every procurement added. Unpaid ones can be deleted."
        action={<ShoppingCart className="h-4 w-4 text-ink-300" />} />
      {loading ?
      <p className="px-5 py-6 text-sm text-ink-500">Loading procurement…</p> :
      records.length === 0 ?
      <p className="px-5 py-6 text-sm text-ink-500">No procurement added yet.</p> :

      <>
          <ProcurementTotalsSummary records={records} />
          <ul className="divide-y divide-ink-100">
            {records.map((record) =>
          <li key={record.id} className="space-y-3 px-5 py-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={record.isProcurementPaid ? 'success' : 'warning'}>
                      {record.isProcurementPaid ? 'Paid' : 'Awaiting payment'}
                    </Badge>
                    <span className="text-xs text-ink-400">{formatDate(record.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-heading text-base font-semibold text-ink-950">
                      {convertToThousand(record.totalCost)}
                    </span>
                    {record.isProcurementPaid ? null :
                <button
                  type="button"
                  onClick={() => setPendingDelete(record)}
                  disabled={deletingId === record.id}
                  aria-label="Delete procurement"
                  title="Delete procurement"
                  className="ml-1 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40">

                        <Trash2 className="h-4 w-4" />
                      </button>
                }
                  </div>
                </div>

                {record.documentUrl ?
            <ProcurementDocumentActions url={record.documentUrl} name={record.documentName} /> :
            null}

                {record.items?.length ?
            <ul className="space-y-1">
                    {record.items.map((item, i) =>
              <li key={i} className="flex items-center justify-between gap-3 text-ink-700">
                        <span>
                          {item.title}
                          {item.description ? <span className="text-ink-400"> — {item.description}</span> : null}
                        </span>
                        <span className="shrink-0 font-medium text-ink-900">{convertToThousand(item.amount)}</span>
                      </li>
              )}
                  </ul> :
            null}

                {record.isProcurementPaid && record.paymentReference ?
            <p className="text-xs text-ink-500">
                    Paid via {record.paymentChannel === 'transfer' ? 'bank transfer' : 'Paystack'} · Ref {record.paymentReference}
                  </p> :
            null}
              </li>
          )}
          </ul>
        </>
      }

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete procurement?"
        message={
        pendingDelete ?
        `This removes the ${convertToThousand(pendingDelete.totalCost)} procurement from the booking. The client will no longer be asked to pay it.` :
        ''
        }
        onConfirm={() => pendingDelete && remove(pendingDelete)}
        onClose={() => setPendingDelete(null)} />

    </Card>);

}
