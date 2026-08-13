import React from 'react';
import { Calendar, Clock, MapPin, ShieldCheck, Wallet } from 'lucide-react';
import type { BookingDetail } from '../../../../services/booking/bookingServices';
import { WorkflowFieldsCard } from '../WorkflowFieldsCard';
import { remainingBookingDataEntries, humanizeKey, renderValue } from '../bookingFieldUtils';
import { formatDate, convertToThousand } from '../../../../utils/format';
import { WORKFLOW_THEME, BOOKING_ACCENT_CLASSNAME } from '../../../../utils/bookingWorkflow';

const USED_KEYS = [
'startDate',
'arrivalTime',
'serviceTime',
'paymentOption',
'acceptedTerms',
'deliveryAddress',
'menuTotalPrice',
'vat',
'transportationCost',
'serviceCharge',
'totalBookingCost'];


export function HomeResidenceDetails({ booking }: {booking: BookingDetail;}) {
  const d = booking.bookingData || {};
  const theme = WORKFLOW_THEME.HOME_RESIDENCE;
  const leftover = remainingBookingDataEntries(d, USED_KEYS);

  return (
    <>
      <WorkflowFieldsCard
        title="Service schedule"
        accentIcon={theme.icon}
        accentClassName={BOOKING_ACCENT_CLASSNAME}
        fields={[
        { label: 'Start date', value: formatDate(d.startDate), icon: Calendar },
        { label: 'Arrival time', value: renderValue(d.arrivalTime), icon: Clock },
        { label: 'Service time', value: renderValue(d.serviceTime), icon: Clock },
        { label: 'Payment option', value: renderValue(d.paymentOption), icon: Wallet },
        { label: 'Terms accepted', value: d.acceptedTerms ? 'Yes' : 'No', icon: ShieldCheck }]
        } />


      <WorkflowFieldsCard
        title="Delivery details"
        fields={[{ label: 'Delivery address', value: renderValue(d.deliveryAddress), icon: MapPin }]} />


      <WorkflowFieldsCard
        title="Cost breakdown"
        fields={[
        { label: 'Menu total', value: convertToThousand(d.menuTotalPrice ?? 0) },
        { label: 'Transportation', value: convertToThousand(d.transportationCost ?? 0) },
        { label: 'Service charge', value: convertToThousand(d.serviceCharge ?? 0) },
        { label: 'VAT', value: convertToThousand(d.vat ?? 0) },
        { label: 'Total booking cost', value: convertToThousand(d.totalBookingCost ?? 0) }]
        } />


      {leftover.length > 0 &&
      <WorkflowFieldsCard
        title="Additional details"
        fields={leftover.map(([key, value]) => ({ label: humanizeKey(key), value: renderValue(value) }))} />

      }
    </>);

}
