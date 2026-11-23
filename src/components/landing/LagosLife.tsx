import { MapPin } from 'lucide-react';
import { AdireBackdrop, DANFO_YELLOW } from './lagosTheme';

const occasions = [
'Detty December dinners',
'Owambe & aso-ebi parties',
'Sunday rice with family',
'Birthday small chops',
'Naming ceremonies',
'Office end-of-year',
'Date night on the Island',
'Weekly meal prep'];


/** Lagos scenery + the occasions the city hosts. Replaces the old US testimonials. */
export function LagosLife() {
  return (
    <section id="lagos" className="relative overflow-hidden bg-ink-950 py-20 sm:py-28">
      <AdireBackdrop color={DANFO_YELLOW} opacity={0.05} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-buttons">Lagos life</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Made for every Lagos moment
            </h2>
          </div>
          <p className="text-ink-300 lg:text-right">
            From Ikoyi penthouses to family homes in Surulere — the city never stops hosting, and
            neither do our chefs.
          </p>
        </div>

        {/* Photo mosaic: 1 tall + 3 tiles on large screens, a simple stack on phones. */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[240px_240px]">
          <figure className="relative overflow-hidden rounded-2xl sm:col-span-2 lg:row-span-2">
            <img
              src="/lagos/ikoyi-aerial.jpg"
              alt="Aerial view of Ikoyi, Lagos, with speedboats on the lagoon and the bridge to Victoria Island"
              loading="lazy"
              className="h-full min-h-[280px] w-full object-cover" />

            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-5">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                <MapPin className="h-4 w-4 text-buttons" /> Ikoyi & Victoria Island
              </span>
            </figcaption>
          </figure>
          <figure className="relative overflow-hidden rounded-2xl">
            <img
              src="/lagos/lekki-ikoyi-bridge.jpg"
              alt="The Lekki–Ikoyi Link Bridge at dusk"
              loading="lazy"
              className="h-56 w-full object-cover lg:h-full" />

            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                <MapPin className="h-4 w-4 text-buttons" /> Lekki
              </span>
            </figcaption>
          </figure>
          <figure className="relative overflow-hidden rounded-2xl">
            <img
              src="/lagos/lagos-island.jpg"
              alt="A busy Lagos Island street lined with tall buildings"
              loading="lazy"
              className="h-56 w-full object-cover lg:h-full" />

            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                <MapPin className="h-4 w-4 text-buttons" /> Lagos Island
              </span>
            </figcaption>
          </figure>
          <div
            className="flex flex-col justify-between rounded-2xl p-6 sm:col-span-2"
            style={{ backgroundColor: DANFO_YELLOW }}>

            <p className="font-heading text-2xl font-bold leading-tight text-ink-950">
              Whatever the occasion, we go cook am.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {occasions.map((o) =>
              <li key={o} className="rounded-full border border-ink-950/20 bg-white/60 px-3 py-1 text-xs font-semibold text-ink-950">
                  {o}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>);

}
