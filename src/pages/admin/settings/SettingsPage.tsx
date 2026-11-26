import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Beef, CalendarHeart, ChevronRight, Coins, Truck, Users } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';

interface SettingsCard {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const cards: SettingsCard[] = [
{
  to: '/admin/settings/fees',
  title: 'Fees',
  description: 'Add and edit the platform fees charged on bookings.',
  icon: <Coins className="h-5 w-5" />
},
{
  to: '/admin/settings/service-rates',
  title: 'Service rates',
  description: 'Per-staff rates for each service by number of guests.',
  icon: <Users className="h-5 w-5" />
},
{
  to: '/admin/settings/event-types',
  title: 'Event types',
  description: 'The kinds of events customers can book for.',
  icon: <CalendarHeart className="h-5 w-5" />
},
{
  to: '/admin/settings/protein-options',
  title: 'Protein options',
  description: 'Proteins customers can choose from when booking.',
  icon: <Beef className="h-5 w-5" />
},
{
  to: '/admin/settings/logistics',
  title: 'Logistics',
  description: 'Delivery, transport and travel settings for chefs and orders.',
  icon: <Truck className="h-5 w-5" />
},
{
  to: '/admin/settings/notifications',
  title: 'Notifications',
  description: 'Choose which alerts are sent to admins, chefs and clients.',
  icon: <Bell className="h-5 w-5" />
}];


export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure how Rent a Chef works across bookings, delivery and alerts." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) =>
        <Link
          key={card.to}
          to={card.to}
          className="group flex items-start gap-4 rounded-xl border border-ink-200/80 bg-white p-5 shadow-card transition hover:border-buttons/60 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-buttons/40">

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-buttons/15 text-ink-900">
              {card.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-[15px] font-semibold text-ink-950">{card.title}</span>
              <span className="mt-1 block text-sm text-ink-500">{card.description}</span>
            </span>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-600" />
          </Link>
        )}
      </div>
    </div>);

}
