import React from 'react';
import { Quote } from 'lucide-react';

const stories = [
{
  quote:
  'We hosted twelve people and did not step into the kitchen once. The grocery breakdown arrived before the booking was even confirmed.',
  name: 'Amara Whitfield',
  detail: 'Anniversary dinner · San Francisco'
},
{
  quote:
  'Our wedding brigade handled eighty guests flawlessly. The tasting session sold us — the night itself exceeded it.',
  name: 'Sofia Marchetti',
  detail: 'Wedding catering · Coral Gables'
},
{
  quote:
  'The weekly meal prep quietly gave us back four hours every Sunday. Same chef, same containers, zero admin.',
  name: 'Daniel Okafor',
  detail: 'Weekly meal prep · Brooklyn'
}];


export function Testimonials() {
  return (
    <section id="stories" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Stories
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
            Hosts who stopped cooking for their own parties
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stories.map((story) =>
          <figure
            key={story.name}
            className="flex h-full flex-col rounded-2xl border border-ink-200 bg-ink-50/60 p-7">
            
              <Quote className="h-6 w-6 text-buttons" />
              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-ink-800">
                {story.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-ink-200 pt-4">
                <p className="font-heading text-sm font-semibold text-ink-950">{story.name}</p>
                <p className="mt-0.5 text-xs text-ink-500">{story.detail}</p>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>);

}