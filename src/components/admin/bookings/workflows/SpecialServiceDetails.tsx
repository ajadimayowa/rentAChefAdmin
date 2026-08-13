import React from 'react';
import { Calendar, Clock, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import type { BookingDetail } from '../../../../services/booking/bookingServices';
import { WorkflowFieldsCard } from '../WorkflowFieldsCard';
import { Card, CardHeader } from '../../../ui/Card';
import { remainingBookingDataEntries, humanizeKey, renderValue } from '../bookingFieldUtils';
import { formatDate, convertToThousand } from '../../../../utils/format';
import { WORKFLOW_THEME, BOOKING_ACCENT_CLASSNAME } from '../../../../utils/bookingWorkflow';

interface SelectedMenu {
  id?: string;
  name?: string;
  menuTypeName?: string;
  noOfPeople?: number;
  pricePerHead?: number;
  totalGroceryCost?: number;
  screenshot?: string;
}

const USED_KEYS = [
'startDate',
'arrivalTime',
'serviceTime',
'paymentOption',
'acceptedTerms',
'selectedMenus',
'groceryTotalPrice',
'logisticsCost',
'serviceCharge',
'vat',
'totalBookingCost'];


export function SpecialServiceDetails({ booking }: {booking: BookingDetail;}) {
  const d = booking.bookingData || {};
  const theme = WORKFLOW_THEME.SPECIAL_SERVICE;
  const menus: SelectedMenu[] = Array.isArray(d.selectedMenus) ? d.selectedMenus : [];
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


      <Card>
        <CardHeader
          title="Selected menus"
          description={`${menus.length} menu${menus.length === 1 ? '' : 's'} selected`}
          action={
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${BOOKING_ACCENT_CLASSNAME}`}>
              <Sparkles className="h-4 w-4" />
            </span>
          } />

        {menus.length === 0 ?
        <p className="px-5 py-6 text-sm text-ink-500">No menu selected for this booking.</p> :

        <ul className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {menus.map((menu, i) =>
          <li key={menu.id ?? i} className="flex gap-3 rounded-xl border border-ink-200/80 p-3 transition-shadow hover:shadow-card">
                {menu.screenshot ?
            <img src={menu.screenshot} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> :

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
            }
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{menu.name || 'Unnamed menu'}</p>
                  <p className="text-xs text-ink-500">{menu.menuTypeName || 'General'}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-600">
                    <span>People: {menu.noOfPeople ?? '—'}</span>
                    <span>Price/head: {convertToThousand(menu.pricePerHead ?? 0)}</span>
                    <span>Total: {convertToThousand(menu.totalGroceryCost ?? 0)}</span>
                  </div>
                </div>
              </li>
          )}
          </ul>
        }
      </Card>

      <WorkflowFieldsCard
        title="Cost breakdown"
        fields={[
        { label: 'Grocery total', value: convertToThousand(d.groceryTotalPrice ?? 0) },
        { label: 'Logistics cost', value: convertToThousand(d.logisticsCost ?? 0) },
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
