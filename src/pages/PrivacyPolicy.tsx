import React from 'react';
import { Link } from 'react-router-dom';
import { LandingNav } from '../components/landing/LandingNav';
import { Accordion, type AccordionItem } from '../components/ui/Accordion';

export const SUPPORT_EMAIL = 'rentachefng@gmail.com';
const LAST_UPDATED = 'September 23, 2026';

const sections: {id: string;title: string;body: React.ReactNode;}[] = [
{
  id: 'who-we-are',
  title: 'Who we are',
  body:
  <p>
      Rent A Chef Ng ("RentAChef", "we", "us") connects clients with vetted private chefs for
      private dining, events, catering, meal prep and related consultancy services. We are based
      in Yaba, Lagos, Nigeria. This Privacy Policy explains how we collect, use, share and protect
      personal information when you use our website, mobile apps and services (the "Services"),
      whether you are a client or a chef.
    </p>

},
{
  id: 'information-we-collect',
  title: 'Information we collect',
  body:
  <>
      <p>Depending on how you use the Services, we may collect:</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          <strong className="font-medium text-ink-800">Account details</strong> — name, email
          address, phone number, password and profile photo.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Booking details</strong> — service
          addresses, event dates, guest counts, menu choices, dietary requirements and allergies,
          and notes you share with a chef.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Payment information</strong> — billing
          details and transaction records. Card payments are handled by our third-party payment
          processors.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Chef information</strong> — for chefs,
          professional experience, menus, identity and verification documents, and payout
          (bank) details.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Communications</strong> — messages,
          reviews, feedback, complaints and support requests.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Device and usage data</strong> — IP
          address, browser or device type, pages viewed and similar technical information
          collected through cookies and comparable technologies.
        </li>
      </ul>
    </>

},
{
  id: 'how-we-use-information',
  title: 'How we use your information',
  body:
  <ul className="list-disc space-y-1.5 pl-5">
      <li>To create and manage your account and verify your identity</li>
      <li>To match clients with chefs and to arrange, fulfil and support bookings</li>
      <li>To process payments, refunds and chef payouts</li>
      <li>To send booking updates, service messages and, where permitted, promotions</li>
      <li>To keep the Services safe, including preventing fraud and misuse</li>
      <li>To improve our Services and personalise your experience</li>
      <li>To meet our legal, tax, accounting and regulatory obligations</li>
    </ul>

},
{
  id: 'sharing',
  title: 'How we share information',
  body:
  <>
      <p>We do not sell or rent your personal information. We share it only as needed:</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          <strong className="font-medium text-ink-800">Between clients and chefs</strong> — a
          chef assigned to your booking receives the details needed to deliver it (such as your
          name, address, date and dietary needs), and clients see relevant chef profile details.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Service providers</strong> — payment
          processors, hosting, messaging and analytics providers acting on our behalf.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Legal and safety</strong> — where
          required by law, court order or government request, or to protect the rights, property
          and safety of RentAChef, our users or others.
        </li>
        <li>
          <strong className="font-medium text-ink-800">Business transfers</strong> — as part of
          a merger, acquisition or sale of assets, subject to this Policy.
        </li>
      </ul>
    </>

},
{
  id: 'retention',
  title: 'How long we keep information',
  body:
  <>
      <p>
        We keep personal information for as long as your account is active or as needed to
        provide the Services. When you delete your account, we delete or anonymise your personal
        information, except where we must keep certain records for:
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>Legal, tax, accounting or regulatory requirements (for example, transaction records)</li>
        <li>Security and fraud prevention</li>
        <li>Resolving disputes and enforcing our agreements</li>
      </ul>
      <p className="mt-2">Retained records are kept only as long as those purposes require.</p>
    </>

},
{
  id: 'your-rights',
  title: 'Your rights and choices',
  body:
  <>
      <p>
        Subject to applicable law, including the Nigeria Data Protection Act 2023, you can:
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>Access, update or correct your personal information from your account</li>
        <li>Request a copy of the personal information we hold about you</li>
        <li>Request deletion of your account or of specific personal data</li>
        <li>Object to or restrict certain processing, or withdraw consent</li>
        <li>Opt out of marketing messages at any time</li>
      </ul>
      <p className="mt-2">
        To delete your account or specific data, use our{' '}
        <Link to="/account-deletion" className="font-medium text-buttons hover:underline">
          Account &amp; Data Deletion
        </Link>{' '}
        page. For other requests, email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-buttons hover:underline">
          {SUPPORT_EMAIL}
        </a>
        . We may ask you to verify your identity first.
      </p>
    </>

},
{
  id: 'security',
  title: 'Data security',
  body:
  <p>
      We use industry-standard safeguards to protect personal information from unauthorised
      access, disclosure, alteration or destruction. No method of transmission or storage is
      completely secure, so we cannot guarantee absolute security. Please keep your password
      confidential and tell us if you suspect unauthorised use of your account.
    </p>

},
{
  id: 'cookies',
  title: 'Cookies and similar technologies',
  body:
  <p>
      We use cookies and similar technologies to keep you signed in, remember preferences and
      understand how the Services are used. You can manage cookies through your browser settings;
      disabling some cookies may affect how the Services work.
    </p>

},
{
  id: 'children',
  title: "Children's privacy",
  body:
  <p>
      The Services are not directed to children under 18, and we do not knowingly collect their
      personal information. If you believe a child has provided us with personal information,
      contact us and we will delete it.
    </p>

},
{
  id: 'third-party-links',
  title: 'Third-party websites',
  body:
  <p>
      The Services may link to third-party websites and services. Their privacy practices are
      governed by their own policies, which we encourage you to read.
    </p>

},
{
  id: 'changes',
  title: 'Changes to this policy',
  body:
  <p>
      We may update this Policy from time to time. We will revise the "Last updated" date above
      and, for significant changes, notify you through the Services or by email.
    </p>

},
{
  id: 'contact',
  title: 'Contact us',
  body:
  <p>
      Questions or concerns about this Policy or your personal information? Email us at{' '}
      <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-buttons hover:underline">
        {SUPPORT_EMAIL}
      </a>
      .
    </p>

}];


const faqItems: AccordionItem[] = [
{
  id: 'catering-and-food-delivery',
  title: 'Do you do catering and food delivery?',
  content:
  <p>
      Yes we offer bespoke catering service and food delivery. We have a dedicated business page
      for this @foodstoriesbybee_
    </p>

},
{
  id: 'do-you-train',
  title: 'Do you train?',
  content:
  <p>
      We don't offer training services for now, but it's in our plan. Once our training has
      kickstarted we will advise via all our channels.
    </p>

},
{
  id: 'chef-rental-to-companies',
  title: 'Do you offer chef rental service to catering and event companies?',
  content: <p>Yes we do.</p>
},
{
  id: 'do-you-take-interns',
  title: 'Do you take interns?',
  content:
  <p>
      At the moment we don't take interns, if this changes in the future we will advise via our
      websites and social media handles.
    </p>

},
{
  id: 'where-are-you-based',
  title: 'Where are you based?',
  content: <p>We are located in Lagos, Nigeria and operate majorly in Lagos.</p>
},
{
  id: 'chefs-in-abuja',
  title: 'Do you have chefs in Abuja?',
  content:
  <p>At the moment we don't have chefs in Abuja, if this changes we will advise.</p>

}];


export function PrivacyPolicy() {
  return (
    <div className="w-full bg-ink-50">
      <LandingNav />
      <main className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-medium text-buttons">Legal</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
          How RentAChef collects, uses, shares and protects your personal information.
        </p>
        <p className="mt-2 text-xs text-ink-400">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Sections" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                On this page
              </p>
              <ol className="mt-3 space-y-2 border-l border-ink-200">
                {sections.map((s) =>
                <li key={s.id}>
                    <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l border-transparent pl-3 text-sm text-ink-500 hover:border-buttons hover:text-ink-900">
                      {s.title}
                    </a>
                  </li>
                )}
                <li>
                  <a
                    href="#faq"
                    className="-ml-px block border-l border-transparent pl-3 text-sm text-ink-500 hover:border-buttons hover:text-ink-900">
                    FAQ
                  </a>
                </li>
              </ol>
            </div>
          </nav>

          <div className="min-w-0">
            <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
              <div className="space-y-9">
                {sections.map((s, i) =>
                <section key={s.id} id={s.id} className="scroll-mt-24">
                    <h2 className="font-heading text-lg font-semibold text-ink-950">
                      <span className="mr-2 text-ink-400">{i + 1}.</span>
                      {s.title}
                    </h2>
                    <div className="mt-2.5 text-sm leading-relaxed text-ink-600">{s.body}</div>
                  </section>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-ink-950 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="font-heading text-base font-semibold text-white">
                  Want your data deleted?
                </p>
                <p className="mt-1 text-sm text-ink-300">
                  Request deletion of your account or specific personal data.
                </p>
              </div>
              <Link
                to="/account-deletion"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-buttons px-5 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-amber-400">
                Account &amp; data deletion
              </Link>
            </div>

            <section id="faq" className="scroll-mt-24">
              <h2 className="mt-16 font-heading text-2xl font-semibold tracking-tight text-ink-950">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
                Common questions about our services.
              </p>
              <div className="mt-6">
                <Accordion items={faqItems} />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>);

}
