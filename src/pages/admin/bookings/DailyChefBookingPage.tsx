import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { DailyChefDetails } from '../../../components/admin/bookings/workflows/DailyChefDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function DailyChefBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.DAILY_CHEF}>
      {state.booking && <DailyChefDetails booking={state.booking} />}
    </BookingPageShell>);

}
