import React from 'react';
import { InfoCard, InfoPage, InfoSection, MailLink } from '../components/landing/InfoPage';
import { SUPPORT_EMAIL } from './PrivacyPolicy';

export function Careers() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Careers"
      intro="Join the chefs and team behind Rent a Chef.">
      <InfoCard className="space-y-8">
        <InfoSection title="Chefs">
          <p>
            Are you a professional chef in Lagos? We are always looking for talented, reliable
            chefs to join our network. Email <MailLink email={SUPPORT_EMAIL} /> with your
            experience and a sample menu to apply.
          </p>
        </InfoSection>
        <InfoSection title="Team roles">
          <p>
            We have no open team roles at the moment. You're welcome to send your CV to{' '}
            <MailLink email={SUPPORT_EMAIL} /> and we'll keep it on file.
          </p>
        </InfoSection>
        <InfoSection title="Internships">
          <p>
            We don't take interns at the moment. If this changes, we'll announce it on our website
            and social media channels.
          </p>
        </InfoSection>
      </InfoCard>
    </InfoPage>);

}
