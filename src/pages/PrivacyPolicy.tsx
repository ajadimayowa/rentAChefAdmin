import React from 'react';
import { LandingNav } from '../components/landing/LandingNav';
import { Accordion, type AccordionItem } from '../components/ui/Accordion';

const policyItems: AccordionItem[] = [
{
  id: 'information-we-collect',
  title: '1. Information We Collect',
  content:
  <>
      <p>We may collect various types of personal information from users, including but not limited to:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Contact information (such as name, email address, phone number, address)</li>
        <li>Payment information (credit card details, billing address)</li>
        <li>User preferences and order history</li>
        <li>Feedback, reviews, and comments</li>
        <li>Information provided for consultancy purposes</li>
      </ul>
    </>

},
{
  id: 'how-we-use-your-information',
  title: '2. How We Use Your Information',
  content:
  <>
      <p>We use the collected information for the following purposes:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>To provide our chef rental, catering, food delivery, and consultancy services</li>
        <li>To process and fulfill your orders and payments</li>
        <li>To communicate with you regarding your orders, updates, and promotions</li>
        <li>To improve our Services, customer experience, and offerings</li>
        <li>To respond to your inquiries, feedback, and complaints</li>
        <li>To customize and tailor your experience with our Services</li>
      </ul>
    </>

},
{
  id: 'information-sharing-and-disclosure',
  title: '3. Information Sharing and Disclosure',
  content:
  <>
      <p>We do not sell or rent your personal information to third parties. However, we may share your information in the following cases:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>With our service providers and partners to fulfill orders and provide services</li>
        <li>With trusted third-party payment processors to process payments securely</li>
        <li>In response to legal obligations, court orders, or government requests</li>
        <li>To protect our rights, property, and safety, or the rights and safety of our users</li>
      </ul>
    </>

},
{
  id: 'data-security',
  title: '4. Data Security',
  content:
  <p>
      We employ industry-standard security measures to protect your personal information from
      unauthorized access, disclosure, alteration, or destruction. Despite our best efforts, no
      method of transmission over the internet is completely secure, and we cannot guarantee the
      absolute security of your data.
    </p>

},
{
  id: 'your-choices',
  title: '5. Your Choices',
  content:
  <>
      <p>You can:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Access, update, or correct your personal information by logging into your account</li>
        <li>Opt-out of receiving marketing communications</li>
        <li>Delete your account, subject to legal and contractual obligations</li>
      </ul>
    </>

},
{
  id: 'cookies-and-tracking',
  title: '6. Cookies and Tracking',
  content:
  <p>
      Our website and Services may use cookies and similar technologies to enhance user
      experience and collect usage information. You can manage your cookie preferences through
      your browser settings.
    </p>

},
{
  id: 'links-to-third-party-websites',
  title: '7. Links to Third-Party Websites',
  content:
  <p>
      Our Services may contain links to third-party websites. We are not responsible for their
      privacy practices. We encourage you to read their privacy policies.
    </p>

},
{
  id: 'changes-to-this-privacy-policy',
  title: '8. Changes to this Privacy Policy',
  content:
  <p>
      We may update this Policy periodically to reflect changes in our practices or legal
      requirements. We will notify you of significant changes.
    </p>

},
{
  id: 'contact-us',
  title: '9. Contact Us',
  content:
  <>
      <p>
        If you have any questions, concerns, or requests related to your personal information or
        this Privacy Policy, please contact us via our contact page.
      </p>
      <p className="mt-2">
        By using our Services, you acknowledge that you have read and understood this Privacy
        Policy and consent to the collection, use, and disclosure of your personal information as
        described herein.
      </p>
    </>

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
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-medium text-buttons">Legal</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-500">
          How Rent A Chef collects, uses, and protects your personal information. Tap a section
          below to expand it.
        </p>

        <div className="mt-10">
          <Accordion items={policyItems} />
        </div>

        <h2 className="mt-16 font-heading text-2xl font-semibold tracking-tight text-ink-950">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
          Common questions about our services.
        </p>
        <div className="mt-6">
          <Accordion items={faqItems} />
        </div>
      </main>
    </div>);

}
