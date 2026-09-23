import React from 'react';
import { InfoCard, InfoPage, InfoSection, MailLink } from '../components/landing/InfoPage';
import { SUPPORT_EMAIL } from './PrivacyPolicy';

export function Press() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Press"
      intro="Resources and contacts for journalists and media.">
      <InfoCard className="space-y-8">
        <InfoSection title="Media enquiries">
          <p>
            For interviews, features, partnerships or brand assets, email{' '}
            <MailLink email={SUPPORT_EMAIL} /> with “Press” in the subject line. Please include
            your publication and deadline.
          </p>
        </InfoSection>
        <InfoSection title="About Rent a Chef">
          <p>
            Rent A Chef Ng is a Lagos-based service connecting clients with vetted professional
            chefs for private dining, events, catering and meal prep.
          </p>
        </InfoSection>
      </InfoCard>
    </InfoPage>);

}
