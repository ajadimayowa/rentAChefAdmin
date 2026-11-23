import { ArrowRight } from 'lucide-react';
import { SiteFooter } from './SiteFooter';

export function CtaFooter() {
  return (
    <>
      <section className="bg-ink-50 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="overflow-hidden rounded-3xl bg-ink-950">
            <div className="grid grid-cols-1 items-center gap-10 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                  Your table is set.
                  <span className="block text-buttons">Bring the chef.</span>
                </h2>
                <p className="mt-4 max-w-md text-ink-300">
                  Tonight in Lekki or next month’s owambe in Ikeja — tell us the date and the number
                  of guests. We’ll come back with matched chefs, menus and a fully itemised quote
                  within 24 hours.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#book"
                    className="inline-flex items-center gap-2 rounded-lg bg-buttons px-6 py-3.5 text-[15px] font-medium text-ink-950 transition-colors hover:bg-amber-400">
                    
                    Request a quote
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src="/lagos/lekki-bridge-night.jpg"
                  alt="The Lekki–Ikoyi Link Bridge lit up at night over the lagoon"
                  className="h-full w-full object-cover" />
                
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>);

}