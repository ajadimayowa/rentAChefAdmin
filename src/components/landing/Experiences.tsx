import { ArrowUpRight, Clock, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { AdireBackdrop, NAIJA_GREEN } from './lagosTheme';

/*
 * PRICES ARE PLACEHOLDERS — set each `priceFrom` to the real starting price (in
 * naira) from Chef Level Pricing before going live.
 */
const experiences = [
{
  id: 'private-dining',
  name: 'Private Dining at Home',
  category: 'Private Dining',
  priceFrom: 150000,
  duration: '4–5 hrs',
  guests: '2–12 guests',
  image: '/lagos/party-jollof.jpg',
  alt: 'Party jollof rice with grilled fish, skewers and fresh peppers',
  blurb: 'Smoky party jollof, peppered fish and asun — plated and served at your own table.'
},
{
  id: 'events',
  name: 'Owambe & Events',
  category: 'Events & Catering',
  priceFrom: 750000,
  duration: 'Full day',
  guests: '40–250 guests',
  image: '/lagos/small-chops-family.jpg',
  alt: 'A family smiling at a table with a platter of small chops — puff-puff, spring rolls and suya',
  blurb: 'Small chops, jollof, pepper soup and grills for weddings, birthdays and naming ceremonies.'
},
{
  id: 'meal-prep',
  name: 'Weekly Meal Prep',
  category: 'Meal Prep',
  priceFrom: 85000,
  duration: '4 hrs',
  guests: '1–6 people',
  image: '/lagos/family-dinner.jpg',
  alt: 'A family sitting down together at the dinner table',
  blurb: 'Efo riro, ofe onugbu, stews and proteins — cooked, portioned and labelled for the week.'
}];


export function Experiences() {
  return (
    <section id="experiences" className="relative overflow-hidden bg-ink-50 py-20 sm:py-28">
      <AdireBackdrop color={NAIJA_GREEN} opacity={0.06} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Experiences
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
              Built for the way Lagos hosts
            </h2>
            <p className="mt-4 text-ink-500">
              From Detty December dinners to Sunday rice with the family — a chef who cooks the
              food you actually crave.
            </p>
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
            id={exp.id}
            className="group scroll-mt-24 overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow hover:shadow-card">

              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                src={exp.image}
                alt={exp.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />

                <span
                className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white"
                style={{ backgroundColor: NAIJA_GREEN }}>

                  {exp.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-semibold text-ink-950">{exp.name}</h3>
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
                    <span className="text-xs font-normal text-ink-400">from </span>
                    {formatCurrency(exp.priceFrom)}
                  </span>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>);

}
