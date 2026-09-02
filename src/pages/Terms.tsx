import React from 'react';
import { LandingNav } from '../components/landing/LandingNav';

const sections: { title: string; body: React.ReactNode }[] = [
{
  title: 'Services and Scope',
  body:
  <p>
      The Rental Company agrees to provide professional chef services to the Client. These
      services may include meal preparation, cooking, and delivery as specified in the order.
    </p>

},
{
  title: 'Professional Treatment',
  body:
  <p>
      The Rental Company shall provide the Client with well-trained and experienced chefs who
      will conduct themselves professionally and uphold the highest standards of culinary
      expertise and client service.
    </p>

},
{
  title: 'Payment',
  body:
  <>
      <p>The Client agrees to make full payment for the requested chef services before the scheduled date of service.</p>
      <p className="mt-2">
        Payment shall be made by transfer to the Rental Company's designated account. The Rental
        Company will provide payment details upon confirmation of the booking.
      </p>
    </>

},
{
  title: 'Additional Menus',
  body:
  <p>
      If the Client requests additional menus or changes to the order beyond the initially
      agreed-upon details, the Rental Company may charge extra fees for the additional services
      and ingredients. The Client will be informed of these charges before proceeding with the
      changes.
    </p>

},
{
  title: 'Cancellation and Refunds',
  body:
  <>
      <p>In the event of a cancellation by the Client:</p>
      <p className="mt-2">
        No refund will be provided for any form of cancellations. Cancellation will only suffice
        based on the discretion of the management.
      </p>
    </>

},
{
  title: "Chef's Arrangements",
  body:
  <>
      <p>
        The Client agrees to provide a suitable and fully equipped kitchen for the chef to work
        in, including necessary utensils and cooking equipment.
      </p>
      <p className="mt-2">The Client will ensure a clean and safe working environment for the chef.</p>
      <p className="mt-2">
        The Rental Company shall not be held liable for any damages to the Client's property
        during the chef's services.
      </p>
    </>

},
{
  title: 'Delivery',
  body:
  <p>
      If the service includes meal delivery, the Rental Company will arrange for the safe and
      timely delivery of prepared meals to the designated address provided by the Client.
    </p>

},
{
  title: 'Compliance with Laws',
  body:
  <p>
      The Client acknowledges and agrees to comply with all relevant laws, regulations, and
      health standards applicable to the provision of food services.
    </p>

},
{
  title: 'Indemnification',
  body:
  <p>
      The Client shall indemnify and hold the Rental Company and its chefs harmless from any
      claims, liabilities, damages, or expenses arising out of or in connection with the services
      provided under this Agreement.
    </p>

},
{
  title: 'Governing Law and Dispute Resolution',
  body:
  <>
      <p>This Agreement shall be governed by and interpreted in accordance with the laws of Nigeria.</p>
      <p className="mt-2">
        Any disputes arising out of or in connection with this Agreement shall be dealt with
        according to the law or as deemed fit.
      </p>
    </>

}];


export function Terms() {
  return (
    <div className="w-full bg-ink-50">
      <LandingNav />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-sm font-medium text-buttons">Legal</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
          Terms of Use of Service
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-600">
          This Agreement ("Agreement") is entered into between Rent A Chef Ng ("Rental Company"),
          with its principal office located at Yaba, Lagos, and the undersigned client
          ("Client"), collectively referred to as the "Parties."
        </p>

        <div className="mt-10 space-y-8 rounded-2xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
          {sections.map((section) =>
          <section key={section.title}>
              <h2 className="font-heading text-base font-semibold text-ink-950">{section.title}</h2>
              <div className="mt-2 text-sm leading-relaxed text-ink-600">{section.body}</div>
            </section>
          )}
        </div>

        <p className="mt-8 text-sm leading-relaxed text-ink-500">
          By scrolling to this point the Parties acknowledge that they have read, understood, and
          agreed to the terms and conditions of this Chef Rental Agreement.
        </p>
      </main>
    </div>);

}
