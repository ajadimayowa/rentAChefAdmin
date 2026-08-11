import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { CalendarCheck, ChefHat, Coins, Loader2, Users } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DataTable, type Column } from '../../components/ui/DataTable';
import {
  getAdminDashboard,
  updateChefStatus,
  type AdminDashboardApprovalItem,
  type AdminDashboardBookingRow,
  type AdminDashboardData } from
'../../services/admin/adminServices';
import { convertToThousand, formatDate } from '../../utils/format';
import { bookingStatusTone } from '../../utils/bookingStatus';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    getAdminDashboard().
    then((res) => setData(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load the dashboard.'))).
    finally(() => setLoading(false));
  }, []);

  const approveChef = async (chef: AdminDashboardApprovalItem) => {
    setApproving(chef.id);
    try {
      await updateChefStatus(chef.id, 'approved');
      setData((prev) =>
      prev ?
      {
        ...prev,
        approvalQueue: prev.approvalQueue.filter((c) => c.id !== chef.id),
        metrics: {
          ...prev.metrics,
          approvedChefs: prev.metrics.approvedChefs + 1,
          pendingChefs: Math.max(0, prev.metrics.pendingChefs - 1)
        }
      } :
      prev
      );
      toast.success(`${chef.name} approved. A verification email was sent.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not approve chef.'));
    } finally {
      setApproving(null);
    }
  };

  const columns: Column<AdminDashboardBookingRow>[] = [
  {
    key: 'ref',
    header: 'Booking',
    render: (b) =>
    <div>
          <p className="font-medium text-ink-950">{b.bookingNumber}</p>
          <p className="text-xs text-ink-500">{b.serviceName}</p>
        </div>

  },
  { key: 'client', header: 'Client', render: (b) => b.customerName },
  { key: 'chef', header: 'Chef', render: (b) => b.chefName },
  {
    key: 'date',
    header: 'Date',
    render: (b) =>
    <div>
          <p>{formatDate(b.date)}</p>
          {b.guests != null ? <p className="text-xs text-ink-500">{b.guests} guests</p> : null}
        </div>

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
    align: 'right',
    render: (b) => <Badge tone={bookingStatusTone(b.status)}>{b.status}</Badge>
  }];


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading dashboard…</p>
      </div>);

  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Could not load the dashboard</p>
        <p className="mt-1 text-sm text-ink-500">Refresh the page to try again.</p>
      </div>);

  }

  const { metrics, revenueTrend, approvalQueue, upcomingBookings } = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live view of bookings, revenue and approvals across the marketplace."
        action={
        <Link to="/admin/bookings">
            <Button>View all bookings</Button>
          </Link>
        } />


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue this month"
          value={convertToThousand(metrics.revenueThisMonth)}
          delta={metrics.revenueDeltaPct ?? undefined}
          hint="vs last month"
          icon={<Coins className="h-4 w-4" />} />

        <StatCard
          label="Active bookings"
          value={String(metrics.activeBookings)}
          delta={metrics.activeBookingsDeltaPct ?? undefined}
          hint="chef assigned & in progress"
          icon={<CalendarCheck className="h-4 w-4" />} />

        <StatCard
          label="Approved chefs"
          value={String(metrics.approvedChefs)}
          hint={`${metrics.pendingChefs} awaiting review`}
          icon={<ChefHat className="h-4 w-4" />} />

        <StatCard
          label="Registered customers"
          value={String(metrics.customers)}
          delta={metrics.newCustomersDeltaPct ?? undefined}
          hint="vs last month"
          icon={<Users className="h-4 w-4" />} />

      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue trend" description="Paid booking value over the last 6 months" />
          <div className="h-72 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E39325" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#E39325" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#83838c" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#83838c"
                  tickFormatter={(v) => `₦${Math.round(Number(v) / 1000)}k`} />

                <Tooltip
                  formatter={(value: number) => [convertToThousand(value), 'Revenue']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e7e7e9',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 13
                  }} />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E39325"
                  strokeWidth={2.5}
                  fill="url(#rev)" />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Approval queue" description="Chefs waiting on a decision" />
          <div className="divide-y divide-ink-100">
            {approvalQueue.length === 0 ?
            <p className="px-5 py-10 text-center text-sm text-ink-500">
                Nothing waiting — the queue is clear.
              </p> :

            approvalQueue.map((chef) =>
            <div key={chef.id} className="flex items-center gap-3 px-5 py-3.5">
                  {chef.avatar ?
              <img src={chef.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> :

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
                      {chef.name.split(' ').map((n) => n[0]).join('')}
                    </span>
              }
                  <div className="min-w-0 flex-1">
                    <Link
                  to={`/admin/chefs/${chef.id}`}
                  className="truncate text-sm font-medium text-ink-950 hover:text-buttons">

                      {chef.name}
                    </Link>
                    <p className="truncate text-xs text-ink-500">Chef · joined {formatDate(chef.joinedAt)}</p>
                  </div>
                  <Button size="sm" disabled={approving === chef.id} onClick={() => approveChef(chef)}>
                    Approve
                  </Button>
                </div>
            )
            }
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Upcoming bookings"
          description="Next bookings not yet completed or cancelled"
          action={
          <Link to="/admin/bookings">
              <Button variant="secondary" size="sm">
                Manage
              </Button>
            </Link>
          } />

        <DataTable
          columns={columns}
          rows={upcomingBookings}
          rowKey={(b) => b.id}
          onRowClick={(b) => navigate(`/admin/bookings/${b.id}`)}
          emptyTitle="No upcoming bookings"
          emptyDescription="New bookings will appear here as clients confirm dates." />

      </Card>
    </div>);

}
