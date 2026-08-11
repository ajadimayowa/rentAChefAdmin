import React from 'react';
import { CalendarCheck, ClipboardList, Sparkles, UserSearch } from 'lucide-react';

const steps = [
{
  icon: <UserSearch className="h-5 w-5" />,
  title: 'Tell us the occasion',
  body: 'Share the date, guest count and any dietary needs. We match you to chefs in your city.'
},
{
  icon: <ClipboardList className="h-5 w-5" />,
  title: 'Choose a menu',
  body: 'Pick a signature menu or co-design one. Grocery costs are itemised up front — no surprises.'
},
{
  icon: <CalendarCheck className="h-5 w-5" />,
  title: 'Confirm & relax',
  body: 'Approve the quote and terms in a single tap. Your chef handles sourcing and prep.'
},
{
  icon: <Sparkles className="h-5 w-5" />,
  title: 'Dine, don’t clean',
  body: 'Courses are plated at your table and the kitchen is left exactly as it was found.'
}];


export function HowItWorks() {
  return (
    <section id="how" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
            Four steps from craving to candlelight
          </h2>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) =>
          <li key={step.title} className="bg-white p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-buttons">
                  {step.icon}
                </span>
                <span className="font-heading text-sm font-semibold text-ink-300">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-ink-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
            </li>
          )}
        </ol>
      </div>
    </section>);

}