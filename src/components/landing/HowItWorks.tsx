import { CalendarCheck, ClipboardList, Sparkles, UserSearch } from 'lucide-react';
import { AdireBackdrop } from './lagosTheme';

const steps = [
{
  icon: <UserSearch className="h-5 w-5" />,
  title: 'Tell us the occasion',
  body: 'Birthday, owambe, Sunday rice or a quiet dinner for two. Share the date, guest count and any allergies.'
},
{
  icon: <ClipboardList className="h-5 w-5" />,
  title: 'Pick your menu',
  body: 'Party jollof, native soups, grills, small chops or continental. Market costs are itemised up front, so no surprises.'
},
{
  icon: <CalendarCheck className="h-5 w-5" />,
  title: 'Confirm & pay',
  body: 'Approve the quote and pay securely through Paystack. Your chef handles the market run and prep.'
},
{
  icon: <Sparkles className="h-5 w-5" />,
  title: 'Chop, don’t clean',
  body: 'Food is served hot at your table and the kitchen is left exactly as your chef found it.'
}];


export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden bg-white py-20 sm:py-28">
      <AdireBackdrop color="#0d0d0f" opacity={0.04} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
            From “we’re hosting” to “everybody don chop”
          </h2>
          <p className="mt-4 text-ink-500">Four steps, and you never touch a pot.</p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) =>
          <li key={step.title} className="bg-white p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-buttons">
                  {step.icon}
                </span>
                <span className="font-heading text-sm font-semibold text-ink-300">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-ink-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
            </li>
          )}
        </ol>
      </div>
    </section>);

}
