import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getBookingDetail } from '../../../services/booking/bookingServices';
import { workflowRouteSlug } from '../../../utils/bookingWorkflow';
import { ApiError } from '../../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

/**
 * Legacy/bookmarked `/admin/bookings/:id` links don't carry a workflow, so this
 * resolves the booking's workflow once and forwards to its dedicated page —
 * `/admin/bookings/<workflow-slug>/:id` — where the real detail screen lives.
 */
export function BookingRedirect() {
  const { id } = useParams<{id: string;}>();
  const [slug, setSlug] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBookingDetail(id).
    then((res) => setSlug(workflowRouteSlug(res.payload.workflow))).
    catch((err) => {
      toast.error(errorMessage(err, 'Could not load this booking.'));
      setNotFound(true);
    });
  }, [id]);

  if (notFound) return <Navigate to="/admin/bookings" replace />;
  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading booking…</p>
      </div>);

  }
  return <Navigate to={`/admin/bookings/${slug}/${id}`} replace />;
}
