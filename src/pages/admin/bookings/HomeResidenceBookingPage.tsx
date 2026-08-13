import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { HomeResidenceDetails } from '../../../components/admin/bookings/workflows/HomeResidenceDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function HomeResidenceBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.HOME_RESIDENCE}>
      {state.booking && <HomeResidenceDetails booking={state.booking} />}
    </BookingPageShell>);

}
