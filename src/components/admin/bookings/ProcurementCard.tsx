import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardHeader } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import type { ProcurementRecord } from '../../../services/admin/procurementServices';
import { convertToThousand } from '../../../utils/format';

export function ProcurementCard({ records, loading }: {records: ProcurementRecord[];loading?: boolean;}) {
  return (
    <Card>
      <CardHeader
        title="Procurement"
        description="Grocery/ingredient costs raised for this booking"
        action={<ShoppingCart className="h-4 w-4 text-ink-300" />} />
      {loading ?
      <p className="px-5 py-6 text-sm text-ink-500">Loading procurement…</p> :
      records.length === 0 ?
      <p className="px-5 py-6 text-sm text-ink-500">No procurement added yet.</p> :

      <ul className="divide-y divide-ink-100">
          {records.map((record) =>
        <li key={record.id} className="space-y-2 px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <Badge tone={record.isProcurementPaid ? 'success' : 'warning'}>
                  {record.isProcurementPaid ? 'Paid' : 'Unpaid'}
                </Badge>
                <span className="font-heading text-base font-semibold text-ink-950">
                  {convertToThousand(record.totalCost)}
                </span>
              </div>
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
              </ul>
            </li>
        )}
        </ul>
      }
    </Card>);

}
