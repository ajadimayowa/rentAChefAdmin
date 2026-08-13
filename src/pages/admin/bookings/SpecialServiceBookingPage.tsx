import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { SpecialServiceDetails } from '../../../components/admin/bookings/workflows/SpecialServiceDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function SpecialServiceBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.SPECIAL_SERVICE}>
      {state.booking && <SpecialServiceDetails booking={state.booking} />}
    </BookingPageShell>);

}
