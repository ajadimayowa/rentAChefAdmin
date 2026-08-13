import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Clock,
  CreditCard,
  Landmark,
  Loader2,
  MessageSquarePlus,
  ShoppingCart,
  Users } from
'lucide-react';
import { Card, CardHeader } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { BookingSidebar } from './BookingSidebar';
import { CommentsCard } from './CommentsCard';
import { ProcurementCard } from './ProcurementCard';
import { PaymentDetailsCard } from './PaymentDetailsCard';
import { AssignChefModal } from './AssignChefModal';
import { AddProcurementModal } from './AddProcurementModal';
import { AddCommentModal } from './AddCommentModal';
import { AddPaymentModal } from './AddPaymentModal';
import type { BookingDetail } from '../../../services/booking/bookingServices';
import type { AssignedChef, AddBookingPaymentResult } from '../../../services/admin/adminServices';
import type { ProcurementRecord } from '../../../services/admin/procurementServices';
import { BOOKING_STATUS_OPTIONS, bookingStatusTone } from '../../../utils/bookingStatus';
import { BOOKING_HERO_GRADIENT, formatWorkflowLabel, type WorkflowTheme } from '../../../utils/bookingWorkflow';
import { formatDate } from '../../../utils/format';

function HeroPill({ children }: {children: React.ReactNode;}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm">
      {children}
    </span>);

}

function HeroAction({
  icon,
  onClick,
  children



}: {icon: React.ReactNode;onClick: () => void;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/25">

      {icon}
      {children}
    </button>);

}

export interface BookingPageShellProps {
  booking: BookingDetail | null;
  loading: boolean;
  updating: boolean;
  procurementRecords: ProcurementRecord[];
  procurementLoading: boolean;
  assignChefOpen: boolean;
  setAssignChefOpen: (v: boolean) => void;
  addProcurementOpen: boolean;
  setAddProcurementOpen: (v: boolean) => void;
  addCommentOpen: boolean;
  setAddCommentOpen: (v: boolean) => void;
  addPaymentOpen: boolean;
  setAddPaymentOpen: (v: boolean) => void;
  handleStatusChange: (status: string) => void;
  handleChefAssigned: (chef: AssignedChef, status: string) => void;
  handleCommentAdded: (comments: BookingDetail['comments']) => void;
  handleProcurementCreated: (record: ProcurementRecord) => void;
  handlePaymentAdded: (result: AddBookingPaymentResult) => void;
  theme?: WorkflowTheme;
  children?: React.ReactNode;
}

export function BookingPageShell({
  booking,
  loading,
  updating,
  procurementRecords,
  procurementLoading,
  assignChefOpen,
  setAssignChefOpen,
  addProcurementOpen,
  setAddProcurementOpen,
  addCommentOpen,
  setAddCommentOpen,
  addPaymentOpen,
  setAddPaymentOpen,
  handleStatusChange,
  handleChefAssigned,
  handleCommentAdded,
  handleProcurementCreated,
  handlePaymentAdded,
  theme,
  children
}: BookingPageShellProps) {
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

  const Icon = theme?.icon;

  return (
    <div>
      <Link
        to="/admin/bookings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${BOOKING_HERO_GRADIENT} shadow-card`}>
        <div className="flex flex-wrap items-start justify-between gap-6 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            {Icon &&
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                <Icon className="h-7 w-7 text-white" />
              </span>
            }
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                {formatWorkflowLabel(booking.workflow)} · Booking ID
              </p>
              <h1 className="font-heading text-2xl font-semibold text-white sm:text-3xl">{booking.bookingNumber}</h1>
              <p className="mt-1 text-sm text-white/70">Created {formatDate(booking.createdAt)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <HeroPill>{booking.status}</HeroPill>
                <HeroPill>{booking.paymentStatus}</HeroPill>
                <select
                  value={booking.status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="h-8 rounded-full border-0 bg-white/15 px-3 text-xs font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-ink-900">

                  {BOOKING_STATUS_OPTIONS.map((o) =>
                  <option key={o} value={o}>{o}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {booking.paymentStatus !== 'Paid' &&
            <HeroAction icon={<Landmark className="h-3.5 w-3.5" />} onClick={() => setAddPaymentOpen(true)}>
                Add payment details
              </HeroAction>
            }
            <HeroAction icon={<ChefHat className="h-3.5 w-3.5" />} onClick={() => setAssignChefOpen(true)}>
              Assign chef
            </HeroAction>
            <HeroAction icon={<ShoppingCart className="h-3.5 w-3.5" />} onClick={() => setAddProcurementOpen(true)}>
              Add procurement
            </HeroAction>
            <HeroAction icon={<MessageSquarePlus className="h-3.5 w-3.5" />} onClick={() => setAddCommentOpen(true)}>
              Add comment
            </HeroAction>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 bg-black/10 px-6 py-4 text-sm text-white/90 sm:px-8">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/60" /> {formatDate(booking.date)}
          </span>
          {booking.guests != null &&
          <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-white/60" /> {booking.guests} guests
            </span>
          }
          {booking.modeOfPayment &&
          <span className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-white/60" /> {booking.modeOfPayment}
            </span>
          }
          {booking.bookingType &&
          <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/60" /> {booking.bookingType}
            </span>
          }
          {booking.transactnRef &&
          <span className="text-white/70">
              Ref: <span className="text-white/90">{booking.transactnRef}</span>
            </span>
          }
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {children}

          {booking.paymentDetails && <PaymentDetailsCard details={booking.paymentDetails} />}

          <ProcurementCard records={procurementRecords} loading={procurementLoading} />

          <CommentsCard comments={booking.comments} />

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

        <BookingSidebar booking={booking} />
      </div>

      <AssignChefModal
        open={assignChefOpen}
        onClose={() => setAssignChefOpen(false)}
        bookingId={booking.id}
        currentChefId={booking.chef?.id}
        onAssigned={handleChefAssigned} />


      <AddProcurementModal
        open={addProcurementOpen}
        onClose={() => setAddProcurementOpen(false)}
        bookingId={booking.id}
        onCreated={handleProcurementCreated} />


      <AddCommentModal
        open={addCommentOpen}
        onClose={() => setAddCommentOpen(false)}
        bookingId={booking.id}
        onAdded={handleCommentAdded} />


      <AddPaymentModal
        open={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        bookingId={booking.id}
        onSaved={handlePaymentAdded} />

    </div>);

}
