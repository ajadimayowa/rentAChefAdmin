import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { EventCateringDetails } from '../../../components/admin/bookings/workflows/EventCateringDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function EventCateringBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.EVENT_CATERING}>
      {state.booking && <EventCateringDetails booking={state.booking} />}
    </BookingPageShell>);

}
