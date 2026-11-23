import { DANFO_YELLOW } from './lagosTheme';

// Neighbourhoods and dishes scrolling past like the side of a danfo bus.
const items = [
'Ikoyi',
'Party jollof',
'Lekki Phase 1',
'Small chops',
'Victoria Island',
'Asun & suya',
'Ikeja GRA',
'Native soups',
'Banana Island',
'Pepper soup',
'Magodo',
'Ofada rice',
'Surulere',
'Moi moi',
'Yaba'];


export function LagosRibbon() {
  const row = [...items, ...items]; // doubled so the loop is seamless
  return (
    <div
      className="relative overflow-hidden border-y-4 border-ink-950 py-3"
      style={{ backgroundColor: DANFO_YELLOW }}
      aria-label="Cooking across Lagos: Ikoyi, Lekki, Victoria Island, Ikeja GRA, Banana Island, Magodo, Surulere and Yaba">

      {/* the black stripe every danfo wears */}
      <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink-950/15" />
      <div aria-hidden="true" className="landing-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((item, i) =>
        <span key={i} className="flex items-center gap-8 font-heading text-sm font-bold uppercase tracking-[0.12em] text-ink-950">
            {item}
            <span className="h-2 w-2 rotate-45 bg-ink-950" />
          </span>
        )}
      </div>
    </div>);

}
