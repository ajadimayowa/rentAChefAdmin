import React from 'react';
import { Landmark } from 'lucide-react';
import { Card, CardHeader } from '../../ui/Card';
import type { BookingPaymentDetails } from '../../../services/booking/bookingServices';
import { convertToThousand, formatDate } from '../../../utils/format';

export function PaymentDetailsCard({ details }: {details: BookingPaymentDetails;}) {
  return (
    <Card>
      <CardHeader
        title="Payment details"
        description="Manually recorded payment for this booking"
        action={
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
            <Landmark className="h-4 w-4" />
          </span>
        } />

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-ink-400">Mode</dt>
          <dd className="mt-0.5 text-ink-800">{details.mode === 'Transfer' ? 'Bank Transfer' : 'Cash'}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">Amount</dt>
          <dd className="mt-0.5 font-medium text-ink-900">{convertToThousand(details.amount)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">Transaction reference</dt>
          <dd className="mt-0.5 break-words text-ink-800">{details.transactionRef}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-400">Payment date</dt>
          <dd className="mt-0.5 text-ink-800">{formatDate(details.date)}</dd>
        </div>
        {details.mode === 'Transfer' &&
        <>
            <div>
              <dt className="text-xs text-ink-400">Bank name</dt>
              <dd className="mt-0.5 text-ink-800">{details.bankName || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-400">Account number</dt>
              <dd className="mt-0.5 text-ink-800">{details.accountNumber || '—'}</dd>
            </div>
          </>
        }
      </dl>
    </Card>);

}
