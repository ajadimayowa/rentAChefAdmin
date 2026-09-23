import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Instagram } from 'lucide-react';
import { InfoCard, InfoPage, MailLink } from '../components/landing/InfoPage';
import { SUPPORT_EMAIL } from './PrivacyPolicy';

export function Contact() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Contact us"
      intro="Questions about a booking, becoming a chef, or anything else? We're happy to help.">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard>
          <Mail className="h-5 w-5 text-buttons" />
          <p className="mt-3 font-heading text-base font-semibold text-ink-950">Email</p>
          <p className="mt-1 text-sm text-ink-600">
            <MailLink email={SUPPORT_EMAIL} />
          </p>
        </InfoCard>
        <InfoCard>
          <MapPin className="h-5 w-5 text-buttons" />
          <p className="mt-3 font-heading text-base font-semibold text-ink-950">Location</p>
          <p className="mt-1 text-sm text-ink-600">Yaba, Lagos, Nigeria</p>
        </InfoCard>
        <InfoCard className="sm:col-span-2">
          <Instagram className="h-5 w-5 text-buttons" />
          <p className="mt-3 font-heading text-base font-semibold text-ink-950">Catering &amp; food delivery</p>
          <p className="mt-1 text-sm text-ink-600">
            Our catering and food delivery business is on Instagram at{' '}
            <a
              href="https://instagram.com/foodstoriesbybee_"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-buttons hover:underline">
              @foodstoriesbybee_
            </a>
            .
          </p>
        </InfoCard>
      </div>
      <p className="mt-8 text-sm text-ink-500">
        Looking to delete your account or data? Use our{' '}
        <Link to="/account-deletion" className="font-medium text-buttons hover:underline">
          Account &amp; Data Deletion
        </Link>{' '}
        page.
      </p>
    </InfoPage>);

}
