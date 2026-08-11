import type { BadgeTone } from '../components/ui/Badge';

// Mirrors platform/domain/enums.ts BookingStatus on the backend — the enum
// actually enforced by the model that writes real bookings.
export const BOOKING_STATUS_OPTIONS = [
'Submitted',
'Admin Reviewed',
'Quotation Sent',
'Payment Pending',
'Paid',
'Chef Assigned',
'In Progress',
'Completed',
'Cancelled'] as
const;

export const PAYMENT_STATUS_OPTIONS = ['Unpaid', 'Pending', 'Paid', 'Failed', 'Refunded'] as const;

export function bookingStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'Completed':
    case 'Paid':
      return 'success';
    case 'Cancelled':
      return 'danger';
    case 'Chef Assigned':
    case 'In Progress':
      return 'info';
    case 'Quotation Sent':
    case 'Payment Pending':
      return 'brand';
    case 'Admin Reviewed':
      return 'warning';
    default:
      return 'neutral';
  }
}
