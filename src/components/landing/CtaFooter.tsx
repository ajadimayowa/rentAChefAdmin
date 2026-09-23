import React from 'react';
import { Link } from 'react-router-dom';
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
                  Tell us the date and the number of seats. We’ll come back with matched chefs,
                  menus and a fully itemised quote within 24 hours.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#book"
                    className="inline-flex items-center gap-2 rounded-lg bg-buttons px-6 py-3.5 text-[15px] font-medium text-ink-950 transition-colors hover:bg-amber-400">
                    
                    Request a quote
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-white/5">
                    
                    Open admin portal
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src="/cff85ab8-ce2d-44fe-8ded-7caa8e6f2ccf.jpg"
                  alt="Guests dining at a candlelit table with plated courses"
                  className="h-full w-full object-cover" />
                
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>);

}