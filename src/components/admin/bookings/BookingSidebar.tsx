import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Mail, Phone, Receipt, UserRound } from 'lucide-react';
import { Card, CardHeader } from '../../ui/Card';
import type { BookingDetail } from '../../../services/booking/bookingServices';
import { convertToThousand } from '../../../utils/format';

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function Avatar({ name, tone }: {name?: string;tone: 'buttons' | 'ink';}) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold ${
      tone === 'buttons' ? 'bg-buttons/15 text-amber-800' : 'bg-ink-100 text-ink-600'}`
      }>

      {initials(name)}
    </span>);

}

export function BookingSidebar({ booking }: {booking: BookingDetail;}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Customer" action={<UserRound className="h-4 w-4 text-ink-300" />} />
        {booking.customer ?
        <div className="flex items-start gap-3 p-5 text-sm">
            <Avatar name={booking.customer.fullName} tone="buttons" />
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium text-ink-900">{booking.customer.fullName}</p>
              {booking.customer.email &&
            <div className="flex items-center gap-2 text-ink-600">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                  <span className="truncate">{booking.customer.email}</span>
                </div>
            }
              {booking.customer.phoneNumber &&
            <div className="flex items-center gap-2 text-ink-600">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.customer.phoneNumber}
                </div>
            }
            </div>
          </div> :

        <p className="px-5 py-6 text-sm text-ink-500">No customer on file.</p>
        }
      </Card>

      <Card>
        <CardHeader title="Chef" action={<ChefHat className="h-4 w-4 text-ink-300" />} />
        {booking.chef ?
        <div className="flex items-start gap-3 p-5 text-sm">
            <Avatar name={booking.chef.fullName} tone="ink" />
            <div className="min-w-0 space-y-1">
              <Link
              to={`/admin/chefs/${booking.chef.id}`}
              className="inline-block truncate font-medium text-ink-900 hover:text-buttons">

                {booking.chef.fullName}
              </Link>
              {booking.chef.email &&
            <div className="flex items-center gap-2 text-ink-600">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                  <span className="truncate">{booking.chef.email}</span>
                </div>
            }
              {booking.chef.phoneNumber &&
            <div className="flex items-center gap-2 text-ink-600">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" /> {booking.chef.phoneNumber}
                </div>
            }
            </div>
          </div> :

        <p className="px-5 py-6 text-sm text-ink-500">No chef assigned yet.</p>
        }
      </Card>

      <Card>
        <CardHeader title="Service" />
        <div className="space-y-1 p-5 text-sm">
          <p className="font-medium text-ink-900">{booking.service?.name || '—'}</p>
          {booking.service?.description &&
          <p className="text-ink-500">{booking.service.description}</p>
          }
        </div>
      </Card>

      <Card>
        <CardHeader title="Pricing" action={<Receipt className="h-4 w-4 text-ink-300" />} />
        <div className="space-y-2 p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-500">Chef fee</span>
            <span className="font-medium text-ink-900">
              {convertToThousand(booking.pricingSnapshot?.baseChefFee ?? 0)}
            </span>
          </div>
          <div className="flex justify-between border-t border-ink-200 pt-2">
            <span className="font-medium text-ink-900">Estimated total</span>
            <span className="font-heading text-base font-semibold text-ink-950">
              {convertToThousand(booking.pricingSnapshot?.estimatedTotal ?? 0)}
            </span>
          </div>
        </div>
      </Card>
    </div>);

}
