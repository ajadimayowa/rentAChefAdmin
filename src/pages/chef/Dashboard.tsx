import { CalendarCheck, Loader2, Plus, Star, Utensils, UtensilsCrossed } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AddMenuModal } from '../../components/chef/AddMenuModal';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';
import { getChefDashboard, type ChefDashboardData } from '../../services/chef/chefServices';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

export function ChefDashboard() {
  const authUser = useAuthStore((s) => s.user);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [data, setData] = useState<ChefDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    setLoading(true);
    getChefDashboard().
    then((res) => setData(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load your dashboard.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div>
      <PageHeader
        title={`Welcome back${authUser ? `, ${authUser.name.split(' ')[0]}` : ''}`}
        description="Here's a snapshot of your bookings and standing on Rent a Chef."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddMenuOpen(true)}>
            Add menu
          </Button>
        } />


      {loading ?
      <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
          <p className="mt-3 text-sm text-ink-500">Loading your dashboard…</p>
        </div> :
      !data ?
      <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="font-heading text-lg font-semibold text-ink-900">Could not load your dashboard</p>
          <p className="mt-1 text-sm text-ink-500">Refresh the page to try again.</p>
        </div> :

      <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
            label="Upcoming bookings"
            value={String(data.metrics.upcomingBookings)}
            icon={<CalendarCheck className="h-4.5 w-4.5" />} />

            <StatCard
            label="Jobs completed"
            value={String(data.metrics.jobsCompleted)}
            icon={<Utensils className="h-4.5 w-4.5" />} />

            <StatCard
            label="Rating"
            value={data.metrics.rating ? data.metrics.rating.toFixed(1) : '—'}
            icon={<Star className="h-4.5 w-4.5" />} />

            <StatCard
            label="Menus created"
            value={String(data.metrics.menusCreated)}
            icon={<UtensilsCrossed className="h-4.5 w-4.5" />} />

          </div>

          <Card className="mt-6">
            <CardHeader title="Upcoming bookings" />
            <div className="divide-y divide-ink-200/80">
              {data.upcomingBookings.length === 0 ?
            <p className="px-5 py-6 text-sm text-ink-500">No upcoming bookings yet.</p> :

            data.upcomingBookings.map((b) =>
            <Link
              key={b.id}
              to={`/chef/bookings/${b.id}`}
              className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-ink-50/60">

                    <div>
                      <p className="font-medium text-ink-900">{b.bookingNumber}</p>
                      <p className="text-ink-500">
                        {b.customerName} · {formatDate(b.date)}
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
        </>
      }

      {authUser ?
      <AddMenuModal
        open={addMenuOpen}
        chefId={authUser.id}
        onClose={() => setAddMenuOpen(false)}
        onCreated={() => setAddMenuOpen(false)} /> :

      null}
    </div>);

}
