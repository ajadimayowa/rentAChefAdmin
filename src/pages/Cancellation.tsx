import React from 'react';
import { Link } from 'react-router-dom';
import { InfoCard, InfoPage, InfoSection, MailLink } from '../components/landing/InfoPage';
import { SUPPORT_EMAIL } from './PrivacyPolicy';

export function Cancellation() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Cancellation Policy"
      intro="What happens if you need to cancel or change a booking.">
      <InfoCard className="space-y-8">
        <InfoSection title="Refunds">
          <p>
            Payment for chef services is made in full before the scheduled date of service. No
            refund is provided for any form of cancellation.
          </p>
        </InfoSection>
        <InfoSection title="Cancelling a booking">
          <p>
            Cancellations are accepted only at the discretion of management. To request one,
            email <MailLink email={SUPPORT_EMAIL} /> as early as possible with your booking
            reference and the reason for cancelling.
          </p>
        </InfoSection>
        <InfoSection title="Changes to your order">
          <p>
            If you request additional menus or changes beyond what was agreed, extra fees may
            apply for the additional services and ingredients. We will tell you about any charges
            before making the changes.
          </p>
        </InfoSection>
      </InfoCard>
      <p className="mt-8 text-sm text-ink-500">
        This policy summarises the cancellation terms in our{' '}
        <Link to="/terms" className="font-medium text-buttons hover:underline">
          Terms of Use of Service
        </Link>
        , which take precedence.
      </p>
    </InfoPage>);

}
