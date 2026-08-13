import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { AlaseServiceDetails } from '../../../components/admin/bookings/workflows/AlaseServiceDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function AlaseServiceBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.ALASE_SERVICE}>
      {state.booking && <AlaseServiceDetails booking={state.booking} />}
    </BookingPageShell>);

}
