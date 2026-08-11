import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Users } from
'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getBookingDetail, type BookingDetail } from '../../services/booking/bookingServices';
import { updateBookingStatus } from '../../services/admin/adminServices';
import { BOOKING_STATUS_OPTIONS, bookingStatusTone } from '../../utils/bookingStatus';
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

export function ViewBookingPage() {
  const { id } = useParams<{id: string;}>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookingDetail(id).
    then((res) => setBooking(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load this booking.'))).
    finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (nextStatus: string) => {
    if (!booking) return;
    setUpdating(true);
    try {
      await updateBookingStatus(booking.id, nextStatus);
      setBooking((prev) => prev ? { ...prev, status: nextStatus } : prev);
      toast.success(`Booking moved to ${nextStatus}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update booking status.'));
    } finally {
      setUpdating(false);
    }
  };

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
        <Link to="/admin/bookings" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-buttons">
          <ArrowLeft className="h-4 w-4" /> Back to bookings
        </Link>
      </div>);

  }

  const bookingDataEntries = Object.entries(booking.bookingData || {});

  return (
    <div>
      <Link
        to="/admin/bookings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <PageHeader
        title={booking.bookingNumber}
        description={`${booking.workflow || 'Booking'} · Created ${formatDate(booking.createdAt)}`}
        action={
        <div className="flex items-center gap-2">
            <Badge tone={booking.paymentStatus === 'Paid' ? 'success' : 'neutral'}>{booking.paymentStatus}</Badge>
            <select
            value={booking.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-800 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25">

              {BOOKING_STATUS_OPTIONS.map((o) =>
            <option key={o} value={o}>{o}</option>
            )}
            </select>
          </div>
        } />


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Booking details" />
            <div className="grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-ink-700">
                <Badge tone={bookingStatusTone(booking.status)}>{booking.status}</Badge>
              </div>
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
              {booking.modeOfPayment &&
              <div className="flex items-center gap-2 text-ink-700">
                  <CreditCard className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{booking.modeOfPayment}</span>
                </div>
              }
              {booking.bookingType &&
              <div className="flex items-center gap-2 text-ink-700">
                  <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                  <span>{booking.bookingType}</span>
                </div>
              }
              {booking.transactnRef &&
              <div className="text-ink-700">
                  <span className="text-ink-400">Transaction ref: </span>{booking.transactnRef}
                </div>
              }
            </div>
          </Card>

          {bookingDataEntries.length > 0 &&
          <Card>
              <CardHeader title="Workflow details" description="Fields captured for this booking's workflow" />
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

          {booking.procurement &&
          <Card>
              <CardHeader title="Procurement" />
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-5 text-sm sm:grid-cols-2">
                {Object.entries(booking.procurement).map(([key, value]) =>
              <div key={key}>
                    <dt className="text-xs text-ink-400">{humanizeKey(key)}</dt>
                    <dd className="mt-0.5 text-ink-800">{renderValue(value)}</dd>
                  </div>
              )}
              </dl>
            </Card>
          }

          <Card>
            <CardHeader title="Timeline" />
            {booking.timeline && booking.timeline.length > 0 ?
            <ul className="divide-y divide-ink-100">
                {booking.timeline.map((t, i) =>
              <li key={i} className="flex items-start justify-between gap-3 px-5 py-3.5 text-sm">
                    <div>
                      <Badge tone={bookingStatusTone(t.status)}>{t.status}</Badge>
                      {t.reason && <p className="mt-1 text-xs text-ink-500">{t.reason}</p>}
                    </div>
                    <p className="whitespace-nowrap text-xs text-ink-400">{formatDate(t.changedAt)}</p>
                  </li>
              )}
              </ul> :

            <p className="px-5 py-6 text-sm text-ink-500">No status changes recorded yet.</p>
            }
          </Card>
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
            <CardHeader title="Chef" />
            {booking.chef ?
            <div className="space-y-2 p-5 text-sm">
                <Link
                to={`/admin/chefs/${booking.chef.id}`}
                className="inline-flex items-center gap-1.5 font-medium text-ink-900 hover:text-buttons">

                  <ChefHat className="h-3.5 w-3.5" /> {booking.chef.fullName}
                </Link>
                {booking.chef.email &&
              <div className="flex items-center gap-2 text-ink-600">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.chef.email}
                  </div>
              }
                {booking.chef.phoneNumber &&
              <div className="flex items-center gap-2 text-ink-600">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.chef.phoneNumber}
                  </div>
              }
              </div> :

            <p className="px-5 py-6 text-sm text-ink-500">No chef assigned yet.</p>
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
            <CardHeader title="Pricing" />
            <div className="space-y-2 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Chef fee</span>
                <span className="font-medium text-ink-900">
                  {convertToThousand(booking.pricingSnapshot?.baseChefFee ?? 0)}
                </span>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-2">
                <span className="font-medium text-ink-900">Estimated total</span>
                <span className="font-heading text-base font-semibold text-ink-950">
                  {convertToThousand(booking.pricingSnapshot?.estimatedTotal ?? 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

}
