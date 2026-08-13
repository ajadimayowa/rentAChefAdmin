import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { DinnerPartyDetails } from '../../../components/admin/bookings/workflows/DinnerPartyDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function DinnerPartyBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.DINNER_PARTY}>
      {state.booking && <DinnerPartyDetails booking={state.booking} />}
    </BookingPageShell>);

}
