import React from 'react';
import { Star } from 'lucide-react';

const chefs = [
{
  name: 'Antoine Dubois',
  tier: 'Signature',
  city: 'San Francisco',
  cuisines: 'French · Modern European',
  rating: 4.9,
  jobs: 212
},
{
  name: 'Naledi Mokoena',
  tier: 'Executive',
  city: 'Brooklyn',
  cuisines: 'Pan-African · Fusion',
  rating: 4.8,
  jobs: 164
},
{
  name: 'Kenji Watanabe',
  tier: 'Executive',
  city: 'Chicago',
  cuisines: 'Japanese · Kaiseki',
  rating: 4.9,
  jobs: 187
},
{
  name: 'Renzo Alcantara',
  tier: 'Premium',
  city: 'Miami',
  cuisines: 'Peruvian · Seafood',
  rating: 4.7,
  jobs: 98
}];


const avatar = "/1a869219-57d2-43b6-88b5-a521f3f41fdf.jpg";


export function ChefsShowcase() {
  return (
    <section id="chefs" className="bg-ink-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-buttons">
            The roster
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Every chef is interviewed, tasted and background-checked
          </h2>
          <p className="mt-4 text-ink-300">
            Chefs are tiered by experience and technique — Standard through Signature — so pricing
            stays transparent whatever the occasion.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {chefs.map((chef) =>
          <article
            key={chef.name}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-buttons/40">
            
              <img
              src={avatar}
              alt={chef.name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-buttons/40" />
            
              <h3 className="mt-4 font-heading text-lg font-semibold text-white">{chef.name}</h3>
              <p className="mt-1 text-sm text-ink-400">{chef.cuisines}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="rounded-full bg-buttons/15 px-2.5 py-0.5 text-xs font-medium text-buttons">
                  {chef.tier}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-ink-300">
                  <Star className="h-3.5 w-3.5 fill-buttons text-buttons" />
                  {chef.rating} · {chef.jobs} jobs
                </span>
              </div>
              <p className="mt-3 text-xs text-ink-500">{chef.city}</p>
            </article>
          )}
        </div>
      </div>
    </section>);

}