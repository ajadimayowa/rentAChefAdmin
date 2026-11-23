import { AdireBackdrop, DANFO_YELLOW } from './lagosTheme';

const chefs = [
{
  name: 'Bassey Veronica',
  photo: '/featuredchefs/BasseyVeronica.jpg',
  tier: 'Executive Chef',
  city: 'Lagos Mainland',
  cuisines: 'Continental · Local'
},
{
  name: 'Funmilayo Omogboye',
  photo: '/featuredchefs/FunmilayoOmogboye.jpg',
  tier: 'Sous Chef',
  city: 'Lagos Island',
  cuisines: 'Pan-African · Fusion'
},
{
  name: 'Okanlawon Olumide',
  photo: '/featuredchefs/OkanlawonOlumide.jpg',
  tier: 'Junior Chef',
  city: 'Surulere',
  cuisines: 'Continental'
},
{
  name: 'Ibrahim Taiwo',
  photo: '/featuredchefs/IbrahimTaiwo.jpg',
  tier: 'Junior Chef',
  city: 'Lagos Mainland',
  cuisines: 'Local'
}];


export function ChefsShowcase() {
  return (
    <section id="chefs" className="relative overflow-hidden bg-ink-900 py-20 sm:py-28">
      <AdireBackdrop color={DANFO_YELLOW} opacity={0.04} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-buttons">
            The roster
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Every chef is interviewed, tasted and background-checked
          </h2>
          <p className="mt-4 text-ink-300">
            Lagos-based chefs who know their way around a pot of jollof and a plated continental
            menu alike. Each is levelled by experience — from Junior to Executive — so pricing stays
            transparent whatever the occasion.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {chefs.map((chef) =>
          <article
            key={chef.name}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-buttons/40">
            
              <img
              src={chef.photo}
              alt={chef.name}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-buttons/40" />
            
              <h3 className="mt-4 font-heading text-lg font-semibold text-white">{chef.name}</h3>
              <p className="mt-1 text-sm text-ink-400">{chef.cuisines}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="rounded-full bg-buttons/15 px-2.5 py-0.5 text-xs font-medium text-buttons">
                  {chef.tier}
                </span>
              </div>
              <p className="mt-3 text-xs text-ink-500">{chef.city}</p>
            </article>
          )}
        </div>
      </div>
    </section>);

}