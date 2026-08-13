import React from 'react';
import { CalendarHeart, MapPin, Users, Wine } from 'lucide-react';
import type { BookingDetail } from '../../../../services/booking/bookingServices';
import { WorkflowFieldsCard } from '../WorkflowFieldsCard';
import { remainingBookingDataEntries, humanizeKey, renderValue } from '../bookingFieldUtils';
import { formatDate } from '../../../../utils/format';
import { WORKFLOW_THEME, BOOKING_ACCENT_CLASSNAME } from '../../../../utils/bookingWorkflow';

const USED_KEYS = ['eventType', 'eventDate', 'numberOfGuests', 'venue'];

export function DateNightDetails({ booking }: {booking: BookingDetail;}) {
  const d = booking.bookingData || {};
  const theme = WORKFLOW_THEME.DATE_NIGHT;
  const leftover = remainingBookingDataEntries(d, USED_KEYS);

  return (
    <>
      <WorkflowFieldsCard
        title="Date night details"
        description="What's planned and where"
        accentIcon={theme.icon}
        accentClassName={BOOKING_ACCENT_CLASSNAME}
        fields={[
        { label: 'Event type', value: renderValue(d.eventType), icon: Wine },
        { label: 'Event date', value: formatDate(d.eventDate), icon: CalendarHeart },
        { label: 'Number of guests', value: renderValue(d.numberOfGuests), icon: Users },
        { label: 'Venue', value: renderValue(d.venue), icon: MapPin }]
        } />


      {leftover.length > 0 &&
      <WorkflowFieldsCard
        title="Additional details"
        fields={leftover.map(([key, value]) => ({ label: humanizeKey(key), value: renderValue(value) }))} />

      }
    </>);

}
