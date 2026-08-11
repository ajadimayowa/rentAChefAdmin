import React from 'react';
import { ArrowUpRight, Clock, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const experiences = [
{
  name: 'Signature Tasting Menu',
  category: 'Private Dining',
  price: 480,
  duration: '5 hrs',
  guests: '2–12 guests',
  image: "/cff85ab8-ce2d-44fe-8ded-7caa8e6f2ccf.jpg",

  blurb: 'Seven courses, wine pairing guidance and full table service.'
},
{
  name: 'Fire & Smoke Feast',
  category: 'Events & Catering',
  price: 2400,
  duration: '10 hrs',
  guests: '40–250 guests',
  image: "/8fff55f4-ffbf-49c5-8033-e45b1d7b5219.jpg",

  blurb: 'Live-fire cooking with a full brigade for weddings and celebrations.'
},
{
  name: 'Weekly Meal Prep',
  category: 'Meal Prep',
  price: 260,
  duration: '4 hrs',
  guests: '1–6 people',
  image: "/1fe7289d-54ea-4414-b3c8-69e1b4045cc4.jpg",

  blurb: 'Ten chef-cooked meals, portioned, labelled and ready for the week.'
}];


export function Experiences() {
  return (
    <section id="experiences" className="bg-ink-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Experiences
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
              Built for the way you actually host
            </h2>
          </div>
          <a
            href="#book"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
            
            Browse all services
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {experiences.map((exp) =>
          <article
            key={exp.name}
            className="group overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow hover:shadow-card">
            
              <div className="aspect-[3/2] overflow-hidden">
                <img
                src={exp.image}
                alt={exp.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              
              </div>
              <div className="p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  {exp.category}
                </p>
                <h3 className="mt-2 font-heading text-xl font-semibold text-ink-950">{exp.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{exp.blurb}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-4 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {exp.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {exp.guests}
                  </span>
                  <span className="ml-auto font-heading text-base font-semibold text-ink-950">
                    {formatCurrency(exp.price)}
                    <span className="text-xs font-normal text-ink-400"> from</span>
                  </span>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}