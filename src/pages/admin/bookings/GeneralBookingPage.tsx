import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { GenericWorkflowDetails } from '../../../components/admin/bookings/workflows/GenericWorkflowDetails';
import { useBookingPageState } from './useBookingPageState';

/** Fallback page for bookings whose workflow isn't (yet) one of the 8 known ones. */
export function GeneralBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state}>
      {state.booking && <GenericWorkflowDetails booking={state.booking} />}
    </BookingPageShell>);

}
