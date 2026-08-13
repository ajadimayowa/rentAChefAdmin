import React from 'react';
import { BookingPageShell } from '../../../components/admin/bookings/BookingPageShell';
import { StoragePackageDetails } from '../../../components/admin/bookings/workflows/StoragePackageDetails';
import { WORKFLOW_THEME } from '../../../utils/bookingWorkflow';
import { useBookingPageState } from './useBookingPageState';

export function StoragePackageBookingPage() {
  const state = useBookingPageState();
  return (
    <BookingPageShell {...state} theme={WORKFLOW_THEME.STORAGE_PACKAGE}>
      {state.booking && <StoragePackageDetails booking={state.booking} />}
    </BookingPageShell>);

}
