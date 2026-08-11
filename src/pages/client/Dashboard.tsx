import { CalendarCheck, Coins, Loader2, PartyPopper } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';
import { getClientDashboard, type ClientDashboardData } from '../../services/client/clientServices';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

export function ClientDashboard() {
  const authUser = useAuthStore((s) => s.user);
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
    getClientDashboard(authUser.id).
    then((res) => setData(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load your dashboard.'))).
    finally(() => setLoading(false));
  }, [authUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading your dashboard…</p>
      </div>);

  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Could not load your dashboard</p>
        <p className="mt-1 text-sm text-ink-500">Refresh the page to try again.</p>
      </div>);

  }

  return (
    <div>
      <PageHeader
        title={`Welcome back${data.user.firstName ? `, ${data.user.firstName}` : ''}`}
        description="Track your bookings and manage upcoming chef experiences." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Upcoming bookings"
          value={String(data.metrics.upcomingBookings)}
          icon={<CalendarCheck className="h-4.5 w-4.5" />} />

        <StatCard
          label="Total bookings"
          value={String(data.metrics.totalBookings)}
          icon={<PartyPopper className="h-4.5 w-4.5" />} />

        <StatCard
          label="Lifetime spend"
          value={convertToThousand(data.metrics.lifetimeSpend)}
          icon={<Coins className="h-4.5 w-4.5" />} />

      </div>

      <Card className="mt-6">
        <CardHeader title="Upcoming bookings" />
        <div className="divide-y divide-ink-200/80">
          {data.upcomingBookings.length === 0 ?
          <p className="px-5 py-6 text-sm text-ink-500">No upcoming bookings yet.</p> :

          data.upcomingBookings.map((b) =>
          <Link
            key={b.id}
            to={`/client/bookings/${b.id}`}
            className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-ink-50/60">

                <div>
                  <p className="font-medium text-ink-900">{b.bookingNumber}</p>
                  <p className="text-ink-500">
                    {b.serviceName} · {formatDate(b.date)}
                    {b.guests != null ? ` · ${b.guests} guests` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-buttons/15 px-2.5 py-1 text-xs font-medium text-amber-700">
                  {b.status}
                </span>
              </Link>
          )
          }
        </div>
      </Card>
    </div>);

}
