import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { DateNightDetails } from '../../../components/admin/bookings/workflows/DateNightDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function DateNightBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.DATE_NIGHT}>
      {state.booking && <DateNightDetails booking={state.booking} />}
    </BookingPageShell>);

}
