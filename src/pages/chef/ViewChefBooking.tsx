import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Loader2, Mail, Phone, Users, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getBookingDetail, type BookingDetail } from '../../services/booking/bookingServices';
import { respondToBooking } from '../../services/chef/bookingServices';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { bookingStatusTone } from '../../utils/bookingStatus';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const humanizeKey = (key: string): string =>
key.
replace(/([a-z0-9])([A-Z])/g, '$1 $2').
replace(/^./, (c) => c.toUpperCase());

const renderValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/**
 * Lets the assigned chef confirm availability. Accepting keeps the booking; declining
 * (with a reason) hands it back to the admins to reassign.
 */
function ChefResponseCard({
  booking,
  onAccepted,
  onDeclined



}: {booking: BookingDetail;onAccepted: () => void;onDeclined: () => void;}) {
  const [submitting, setSubmitting] = useState<'accept' | 'decline' | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState('');
  const status = booking.chefResponse?.status ?? 'pending';

  const respond = async (action: 'accept' | 'decline') => {
    setSubmitting(action);
    try {
      await respondToBooking(booking.id, action, action === 'decline' ? reason.trim() : undefined);
      if (action === 'accept') {
        toast.success('Booking accepted. Thanks for confirming!');
        onAccepted();
      } else {
        toast.success('Booking declined. The team will reassign it.');
        setDeclineOpen(false);
        onDeclined();
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save your response.'));
    } finally {
      setSubmitting(null);
    }
  };

  if (status === 'accepted') {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-sm text-emerald-900">
          <span className="font-medium">You accepted this booking.</span> The client is counting on you — reach out to the
          team if anything changes.
        </p>
      </div>);

  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div>
          <p className="font-heading text-base font-semibold text-ink-950">Can you take this booking?</p>
          <p className="mt-0.5 text-sm text-ink-600">
            Check the date and details below, then confirm your availability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<XCircle className="h-4 w-4" />}
            disabled={Boolean(submitting)}
            onClick={() => setDeclineOpen(true)}>

            Decline
          </Button>
          <Button
            icon={<CheckCircle2 className="h-4 w-4" />}
            disabled={Boolean(submitting)}
            onClick={() => respond('accept')}>

            {submitting === 'accept' ? 'Accepting…' : 'Accept booking'}
          </Button>
        </div>
      </div>

      <Modal
        open={declineOpen}
        onClose={() => !submitting && setDeclineOpen(false)}
        title="Decline this booking"
        description="Let the team know why, so they can reassign it to another chef."
        size="md">

        <div className="px-6 py-5">
          <label htmlFor="decline-reason" className="mb-1.5 block text-sm font-medium text-ink-800">
            Reason
          </label>
          <textarea
            id="decline-reason"
            rows={4}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. I'm already booked on that date."
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />

        </div>
        <ModalFooter>
          <Button variant="secondary" type="button" disabled={Boolean(submitting)} onClick={() => setDeclineOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!reason.trim() || Boolean(submitting)} onClick={() => respond('decline')}>
            {submitting === 'decline' ? 'Declining…' : 'Decline booking'}
          </Button>
        </ModalFooter>
      </Modal>
    </>);

}

export function ViewChefBooking() {
  const { id } = useParams<{id: string;}>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookingDetail(id).
    then((res) => setBooking(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load this booking.'))).
    finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        <p className="mt-3 text-sm text-ink-500">Loading booking…</p>
      </div>);

  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-heading text-lg font-semibold text-ink-900">Booking not found</p>
        <Link to="/chef/bookings" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">
          <ArrowLeft className="h-4 w-4" /> Back to bookings
        </Link>
      </div>);

  }

  const bookingDataEntries = Object.entries(booking.bookingData || {});

  return (
    <div>
      <Link
        to="/chef/bookings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <PageHeader
        title={booking.bookingNumber}
        description={`${booking.workflow || 'Booking'} · Created ${formatDate(booking.createdAt)}`}
        action={<Badge tone={bookingStatusTone(booking.status)}>{booking.status}</Badge>} />

      {booking.chefResponse ?
      <ChefResponseCard
        booking={booking}
        onAccepted={() =>
        setBooking((prev) => prev ? { ...prev, chefResponse: { ...prev.chefResponse, status: 'accepted' } } : prev)
        }
        // Once declined the booking is no longer this chef's — back to their list.
        onDeclined={() => navigate('/chef/bookings')} /> :

      null}


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Booking details" />
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-ink-700">
                <Calendar className="h-4 w-4 shrink-0 text-ink-400" />
                <span>{formatDate(booking.date)}</span>
              </div>
              {booking.guests != null &&
              <div className="flex items-center gap-2 text-ink-700">
                  <Users className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{booking.guests} guests</span>
                </div>
              }
              {booking.bookingType &&
              <div className="flex items-center gap-2 text-ink-700">
                  <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{booking.bookingType}</span>
                </div>
              }
            </div>
          </Card>

          {bookingDataEntries.length > 0 &&
          <Card>
              <CardHeader title="Job details" description="What the customer asked for" />
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
                {bookingDataEntries.map(([key, value]) =>
              <div key={key}>
                    <dt className="text-xs text-ink-400">{humanizeKey(key)}</dt>
                    <dd className="mt-0.5 break-words text-ink-800">{renderValue(value)}</dd>
                  </div>
              )}
              </dl>
            </Card>
          }
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" />
            {booking.customer ?
            <div className="space-y-2 p-5 text-sm">
                <p className="font-medium text-ink-900">{booking.customer.fullName}</p>
                {booking.customer.email &&
              <div className="flex items-center gap-2 text-ink-600">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.customer.email}
                  </div>
              }
                {booking.customer.phoneNumber &&
              <div className="flex items-center gap-2 text-ink-600">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.customer.phoneNumber}
                  </div>
              }
              </div> :

            <p className="px-5 py-6 text-sm text-ink-500">No customer on file.</p>
            }
          </Card>

          <Card>
            <CardHeader title="Service" />
            <div className="space-y-1 p-5 text-sm">
              <p className="font-medium text-ink-900">{booking.service?.name || '—'}</p>
              {booking.service?.description &&
              <p className="text-ink-500">{booking.service.description}</p>
              }
            </div>
          </Card>

          <Card>
            <CardHeader title="Your fee" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-ink-900">Chef fee</span>
                <span className="font-heading text-base font-semibold text-ink-950">
                  {convertToThousand(booking.pricingSnapshot?.baseChefFee ?? 0)}
                </span>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-2 text-ink-500">
                <span>Booking total</span>
                <span>{convertToThousand(booking.pricingSnapshot?.estimatedTotal ?? 0)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}
