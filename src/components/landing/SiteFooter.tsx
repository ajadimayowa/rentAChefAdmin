import React from 'react';
import { Link } from 'react-router-dom';

const footerColumns: {title: string;items: {label: string;to: string;}[];}[] = [
{
  title: 'Experiences',
  items: [
  { label: 'Private dining', to: '/#private-dining' },
  { label: 'Events', to: '/#events' },
  { label: 'Meal prep', to: '/#meal-prep' },
  { label: 'Classes', to: '/classes' }]

},
{
  title: 'Company',
  items: [
  { label: 'About', to: '/about' },
  { label: 'Careers', to: '/careers' },
  { label: 'Press', to: '/press' },
  { label: 'Contact', to: '/contact' }]

},
{
  title: 'Legal',
  items: [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Account deletion', to: '/account-deletion' },
  { label: 'Cancellation', to: '/cancellation' },
  { label: 'Food safety', to: '/food-safety' }]

}];


export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-info text-ink-950">
              <img src="/rentAChefIconTrans.png" alt="RentAChef" className="h-5 w-5 object-contain" />
            </span>
            <span className="font-heading text-lg font-semibold text-ink-950">Rent a Chef</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            Vetted private chefs for dinners, events and weekly meal prep across 14 cities.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footerColumns.map((col) =>
          <div key={col.title}>
              <p className="font-heading text-sm font-semibold text-ink-950">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.items.map((item) =>
              <li key={item.label}>
                    <Link to={item.to} className="text-sm text-ink-500 hover:text-ink-900">
                      {item.label}
                    </Link>
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-ink-200 px-5 pt-6 sm:px-8">
        <p className="text-xs text-ink-400">
          © {new Date().getFullYear()} Rent a Chef. All rights reserved.
        </p>
      </div>
    </footer>);

}
