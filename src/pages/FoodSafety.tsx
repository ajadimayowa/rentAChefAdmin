import React from 'react';
import { InfoCard, InfoPage, InfoSection, MailLink } from '../components/landing/InfoPage';
import { SUPPORT_EMAIL } from './PrivacyPolicy';

export function FoodSafety() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Food Safety"
      intro="How we and our clients work together to keep every meal safe.">
      <InfoCard className="space-y-8">
        <InfoSection title="Our chefs">
          <p>
            Every chef on Rent a Chef is vetted before joining. Chefs are expected to follow safe
            food handling practices, including good personal hygiene, careful storage and
            temperature control, and preventing cross-contamination.
          </p>
        </InfoSection>
        <InfoSection title="Allergies and dietary needs">
          <p>
            Tell us about all allergies, intolerances and dietary requirements when you book, and
            remind your chef on the day. While chefs take care to accommodate them, we cannot
            guarantee that any kitchen is completely free of allergens.
          </p>
        </InfoSection>
        <InfoSection title="Your kitchen">
          <p>
            For in-home services, clients agree to provide a clean, safe and fully equipped
            kitchen, including the necessary utensils and cooking equipment.
          </p>
        </InfoSection>
        <InfoSection title="Delivered meals">
          <p>
            Where a service includes meal delivery, we arrange safe and timely delivery to your
            address. Refrigerate meals promptly and follow any storage or reheating instructions
            provided.
          </p>
        </InfoSection>
        <InfoSection title="Report a concern">
          <p>
            If you have a food safety concern about a booking, email{' '}
            <MailLink email={SUPPORT_EMAIL} /> as soon as possible with your booking details.
          </p>
        </InfoSection>
      </InfoCard>
    </InfoPage>);

}
