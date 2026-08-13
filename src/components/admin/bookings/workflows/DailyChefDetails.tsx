import React from 'react';
import { Home, Users, CalendarClock } from 'lucide-react';
import type { BookingDetail } from '../../../../services/booking/bookingServices';
import { WorkflowFieldsCard } from '../WorkflowFieldsCard';
import { remainingBookingDataEntries, humanizeKey, renderValue } from '../bookingFieldUtils';
import { WORKFLOW_THEME, BOOKING_ACCENT_CLASSNAME } from '../../../../utils/bookingWorkflow';

const USED_KEYS = ['familySize', 'durationDays', 'accommodationAvailable'];

export function DailyChefDetails({ booking }: {booking: BookingDetail;}) {
  const d = booking.bookingData || {};
  const theme = WORKFLOW_THEME.DAILY_CHEF;
  const leftover = remainingBookingDataEntries(d, USED_KEYS);

  return (
    <>
      <WorkflowFieldsCard
        title="Daily chef arrangement"
        description="What the household needs from the chef"
        accentIcon={theme.icon}
        accentClassName={BOOKING_ACCENT_CLASSNAME}
        fields={[
        { label: 'Family size', value: renderValue(d.familySize), icon: Users },
        {
          label: 'Duration',
          value: d.durationDays != null ? `${d.durationDays} day${d.durationDays === 1 ? '' : 's'}` : '—',
          icon: CalendarClock
        },
        { label: 'Accommodation available', value: d.accommodationAvailable ? 'Yes' : 'No', icon: Home }]
        } />


      {leftover.length > 0 &&
      <WorkflowFieldsCard
        title="Additional details"
        fields={leftover.map(([key, value]) => ({ label: humanizeKey(key), value: renderValue(value) }))} />

      }
    </>);

}
