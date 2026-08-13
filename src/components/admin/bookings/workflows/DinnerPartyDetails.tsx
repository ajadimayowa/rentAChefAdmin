import React from 'react';
import { Calendar, CalendarCheck, Clock, MapPin, ShieldCheck } from 'lucide-react';
import type { BookingDetail } from '../../../../services/booking/bookingServices';
import { WorkflowFieldsCard } from '../WorkflowFieldsCard';
import { proteinFields, remainingBookingDataEntries, humanizeKey, renderValue, PROTEIN_DATA_KEYS } from '../bookingFieldUtils';
import { formatDate } from '../../../../utils/format';
import { WORKFLOW_THEME, BOOKING_ACCENT_CLASSNAME } from '../../../../utils/bookingWorkflow';

const USED_KEYS = [
'acceptTerms',
...PROTEIN_DATA_KEYS,
'cookingInstructions',
'startDate',
'endDate',
'arrivalTime',
'serviceTime',
'eventAddress'];


export function DinnerPartyDetails({ booking }: {booking: BookingDetail;}) {
  const d = booking.bookingData || {};
  const theme = WORKFLOW_THEME.DINNER_PARTY;
  const leftover = remainingBookingDataEntries(d, USED_KEYS);

  return (
    <>
      <WorkflowFieldsCard
        title="Dinner party schedule"
        description="Dates and arrival window for the dinner party"
        accentIcon={theme.icon}
        accentClassName={BOOKING_ACCENT_CLASSNAME}
        fields={[
        { label: 'Start date', value: formatDate(d.startDate), icon: Calendar },
        { label: 'End date', value: formatDate(d.endDate), icon: CalendarCheck },
        { label: 'Arrival time', value: renderValue(d.arrivalTime), icon: Clock },
        { label: 'Service time', value: renderValue(d.serviceTime), icon: Clock },
        { label: 'Terms accepted', value: d.acceptTerms ? 'Yes' : 'No', icon: ShieldCheck }]
        } />


      <WorkflowFieldsCard
        title="Protein selection"
        description="Quantities requested for this booking"
        fields={proteinFields(d)} />


      <WorkflowFieldsCard title="Venue & instructions">
        <div className="space-y-4 p-5 text-sm">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
            <div>
              <p className="text-xs text-ink-400">Event address</p>
              <p className="mt-0.5 text-ink-800">{renderValue(d.eventAddress)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-400">Cooking instructions</p>
            <p className="mt-0.5 whitespace-pre-wrap text-ink-800">{renderValue(d.cookingInstructions)}</p>
          </div>
        </div>
      </WorkflowFieldsCard>

      {leftover.length > 0 &&
      <WorkflowFieldsCard
        title="Additional details"
        fields={leftover.map(([key, value]) => ({ label: humanizeKey(key), value: renderValue(value) }))} />

      }
    </>);

}
