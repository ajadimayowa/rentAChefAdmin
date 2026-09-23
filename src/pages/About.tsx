import React from 'react';
import { Link } from 'react-router-dom';
import { InfoCard, InfoPage, InfoSection } from '../components/landing/InfoPage';

export function About() {
  return (
    <InfoPage
      eyebrow="Company"
      title="About Rent a Chef"
      intro="We bring professional chefs to your home and events, so you can host without spending the night in the kitchen.">
      <InfoCard className="space-y-8">
        <InfoSection title="What we do">
          <p>
            Rent A Chef Ng connects clients with vetted, professional chefs for private dining,
            dinner parties, events and catering, and weekly meal prep. We also offer chef rental to
            catering and event companies, and culinary consultancy.
          </p>
        </InfoSection>
        <InfoSection title="How we work">
          <p>
            Tell us the occasion, date and guest count. We match you with a chef, agree a menu and
            itemised quote, and your chef handles sourcing, cooking and service, leaving your kitchen
            as they found it.
          </p>
        </InfoSection>
        <InfoSection title="Where we are">
          <p>
            We are based in Yaba, Lagos, Nigeria, and operate mainly in Lagos.
          </p>
        </InfoSection>
      </InfoCard>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/#book"
          className="inline-flex items-center rounded-lg bg-buttons px-5 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-400">
          Book a chef
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-5 py-3 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-50">
          Contact us
        </Link>
      </div>
    </InfoPage>);

}
