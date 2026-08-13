import React from 'react';
import type { BookingDetail } from '../../../../services/booking/bookingServices';
import { WorkflowFieldsCard } from '../WorkflowFieldsCard';
import { humanizeKey, renderValue } from '../bookingFieldUtils';

/** Fallback for bookings without a known workflow (or one not yet given its own screen) — dumps whatever bookingData holds rather than hiding it. */
export function GenericWorkflowDetails({ booking }: {booking: BookingDetail;}) {
  const entries = Object.entries(booking.bookingData || {});
  if (entries.length === 0) return null;
  return (
    <WorkflowFieldsCard
      title="Workflow details"
      description="Fields captured for this booking's workflow"
      fields={entries.map(([key, value]) => ({ label: humanizeKey(key), value: renderValue(value) }))} />);


}
