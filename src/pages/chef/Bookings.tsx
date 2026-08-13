import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { listChefBookings, type ChefBookingListItem } from '../../services/chef/bookingServices';
import { BOOKING_STATUS_OPTIONS, bookingStatusTone } from '../../utils/bookingStatus';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const PAGE_SIZE = 10;

export function ChefBookings() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ChefBookingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    listChefBookings({ status, page, limit: PAGE_SIZE }).
    then((res) => {
      setRows(res.payload);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    }).
    catch((err) => toast.error(errorMessage(err, 'Could not load your bookings.'))).
    finally(() => setLoading(false));
  }, [status, page]);

  const columns: Column<ChefBookingListItem>[] = [
  {
    key: 'ref',
    header: 'Booking',
    render: (b) =>
    <div>
          <p className="font-medium text-ink-950">{b.bookingNumber}</p>
          <p className="text-xs text-ink-500">{b.serviceName}</p>
        </div>

  },
  { key: 'customer', header: 'Customer', render: (b) => b.customerName },
  {
    key: 'when',
    header: 'When',
    render: (b) =>
    <div>
          <p>{formatDate(b.date)}</p>
          {b.guests != null ? <p className="text-xs text-ink-500">{b.guests} guests</p> : null}
        </div>

  },
  {
    key: 'payment',
    header: 'Payment',
    render: (b) => <Badge tone={b.paymentStatus === 'Paid' ? 'success' : 'neutral'}>{b.paymentStatus}</Badge>
  },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    render: (b) => <span className="font-medium">{convertToThousand(b.amount)}</span>
  },
  {
    key: 'status',
    header: 'Status',
    render: (b) => <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
  }];


  return (
    <div>
      <PageHeader
        title="My Bookings"
        description="Every job assigned to you, from submission through completion." />


      <Card>
        <CardHeader title="All bookings" description={`${total} booking${total === 1 ? '' : 's'} on record`} />
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-200/80 px-5 py-3">
          <FilterSelect
            label="Status filter"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={[
            { value: 'all', label: 'All statuses' },
            ...BOOKING_STATUS_OPTIONS.map((o) => ({ value: o, label: o }))]
            } />

        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(b) => b.id}
          onRowClick={(b) => navigate(`/chef/bookings/${b.id}`)}
          emptyTitle={loading ? 'Loading bookings…' : 'No bookings found'}
          emptyDescription={loading ? 'Fetching your booking list.' : 'Adjust your filters to find what you\'re looking for.'} />

        {totalPages > 1 &&
        <div className="flex items-center justify-between border-t border-ink-200 px-5 py-3">
            <p className="text-xs text-ink-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}>

                Prev
              </Button>
              <Button
              variant="secondary"
              size="sm"
              icon={<ChevronRight className="h-4 w-4" />}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>

                Next
              </Button>
            </div>
          </div>
        }
      </Card>
    </div>);

}
