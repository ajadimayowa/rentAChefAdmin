import { procurementTotals, type ProcurementRecord } from '../../services/admin/procurementServices';
import { convertToThousand } from '../../utils/format';

/** Procurement price (sum of every procurement), paid and outstanding — shown to admins and clients. */
export function ProcurementTotalsSummary({ records }: {records: ProcurementRecord[];}) {
  const { total, paid, outstanding } = procurementTotals(records);
  return (
    <dl className="grid grid-cols-3 gap-3 border-b border-ink-100 px-5 py-4 text-sm">
      <div>
        <dt className="text-xs text-ink-400">Procurement total</dt>
        <dd className="mt-0.5 font-heading text-base font-semibold text-ink-950">{convertToThousand(total)}</dd>
      </div>
      <div>
        <dt className="text-xs text-ink-400">Paid</dt>
        <dd className="mt-0.5 font-medium text-emerald-700">{convertToThousand(paid)}</dd>
      </div>
      <div>
        <dt className="text-xs text-ink-400">Outstanding</dt>
        <dd className={`mt-0.5 font-medium ${outstanding > 0 ? 'text-amber-700' : 'text-ink-500'}`}>{convertToThousand(outstanding)}</dd>
      </div>
    </dl>);

}
