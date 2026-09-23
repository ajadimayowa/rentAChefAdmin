import React from 'react';
import { InfoCard, InfoPage, MailLink } from '../components/landing/InfoPage';
import { SUPPORT_EMAIL } from './PrivacyPolicy';

export function Classes() {
  return (
    <InfoPage
      eyebrow="Experiences"
      title="Cooking classes"
      intro="Learn to cook with our professional chefs.">
      <InfoCard>
        <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          Coming soon
        </span>
        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          We don't offer classes or training yet, but it's in our plans. Once classes launch,
          we'll announce it across all our channels.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          Want to hear first? Email <MailLink email={SUPPORT_EMAIL} /> with “Classes” in the
          subject line.
        </p>
      </InfoCard>
    </InfoPage>);

}
