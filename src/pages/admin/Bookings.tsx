import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  listAdminBookings,
  updateBookingStatus,
  type AdminBookingListItem } from
'../../services/admin/adminServices';
import { BOOKING_STATUS_OPTIONS } from '../../utils/bookingStatus';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const PAGE_SIZE = 10;

export function Bookings() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminBookingListItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listAdminBookings({ search, status, page, limit: PAGE_SIZE }).
      then((res) => {
        setRows(res.payload);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
        setStatusCounts(res.meta.statusCounts);
      }).
      catch((err) => toast.error(errorMessage(err, 'Could not load bookings.'))).
      finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status, page]);

  const handleStatusChange = async (booking: AdminBookingListItem, nextStatus: string) => {
    setUpdating(booking.id);
    try {
      await updateBookingStatus(booking.id, nextStatus);
      setRows((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: nextStatus } : b));
      toast.success(`${booking.bookingNumber} moved to ${nextStatus}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update booking status.'));
    } finally {
      setUpdating(null);
    }
  };

  const columns: Column<AdminBookingListItem>[] = [
  {
    key: 'ref',
    header: 'Booking',
    render: (b) =>
    <div>
          <p className="font-medium text-ink-950">{b.bookingNumber}</p>
          <p className="text-xs text-ink-500">{b.serviceName}</p>
        </div>

  },
  {
    key: 'client',
    header: 'Client & chef',
    render: (b) =>
    <div>
          <p>{b.customerName}</p>
          <p className="text-xs text-ink-500">Chef {b.chefName}</p>
        </div>

  },
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
    render: (b) =>
    <select
      value={b.status}
      aria-label={`Status for ${b.bookingNumber}`}
      disabled={updating === b.id}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => handleStatusChange(b, e.target.value)}
      className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-800 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25">

          {BOOKING_STATUS_OPTIONS.map((o) =>
      <option key={o} value={o}>
              {o}
            </option>
      )}
        </select>

  }];


  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Track every engagement, assign chefs and reconcile grocery costs." />


      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {BOOKING_STATUS_OPTIONS.map((o) =>
        <Card key={o} className="p-4">
            <p className="text-xs uppercase tracking-wide text-ink-400">{o}</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-ink-950">{statusCounts[o] || 0}</p>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader title="All bookings" description={`${total} booking${total === 1 ? '' : 's'} on record`} />
        <Toolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search booking number, client or chef…">

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

        </Toolbar>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(b) => b.id}
          onRowClick={(b) => navigate(`/admin/bookings/${b.id}`)}
          emptyTitle={loading ? 'Loading bookings…' : 'No bookings found'}
          emptyDescription={loading ? 'Fetching the booking list.' : 'Adjust your filters to find what you\'re looking for.'} />

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
