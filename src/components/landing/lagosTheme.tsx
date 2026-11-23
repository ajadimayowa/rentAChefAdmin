/**
 * Shared Lagos styling for the landing page.
 *
 * Photos in /public/lagos are from Unsplash (Unsplash License — free for
 * commercial use, no attribution required). Credits, kept as good practice:
 *   ikoyi-aerial.jpg        — Malik Buraimoh   (unsplash.com/photos/EMjpo0YjHPw)
 *   lekki-ikoyi-bridge.jpg  — Tunde Buremo     (unsplash.com/photos/kF0-RhpHhRA)
 *   lekki-bridge-night.jpg  — Opeyemi Adisa    (unsplash.com/photos/Ww2j734hEcA)
 *   lagos-island.jpg        — (unsplash.com/photos/-96tbWkSmLE)
 *   party-jollof.jpg        — Keesha's Kitchen (unsplash.com/photos/PqG32DYCTM8)
 *   small-chops-family.jpg  — Ayodele Adeniyi  (unsplash.com/photos/M8XEw4miJ2s)
 *   family-dinner.jpg       — Ayodele Adeniyi  (unsplash.com/photos/PG9FDJfKKsY)
 */

/** Danfo-bus yellow and Nigerian green, used as accents next to the brand amber. */
export const DANFO_YELLOW = '#F7C600';
export const NAIJA_GREEN = '#008751';

/**
 * Adire-inspired tile (indigo resist-dye motifs: dots, rings and stitched lines),
 * drawn as an inline SVG so it needs no extra asset. `color` is any CSS colour.
 */
export function adirePattern(color: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>
    <g fill='none' stroke='${color}' stroke-width='1.4'>
      <circle cx='16' cy='16' r='9'/><circle cx='16' cy='16' r='4'/>
      <circle cx='48' cy='48' r='9'/><circle cx='48' cy='48' r='4'/>
      <path d='M36 8 l8 8 M44 8 l-8 8 M8 40 l8 8 M16 40 l-8 8'/>
      <path stroke-dasharray='2 4' d='M0 32 H64 M32 0 V64'/>
    </g>
    <g fill='${color}'><circle cx='48' cy='16' r='1.8'/><circle cx='16' cy='48' r='1.8'/></g>
  </svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Decorative pattern layer; place inside a `relative` parent. */
export function AdireBackdrop({ color, opacity = 0.08 }: {color: string;opacity?: number;}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage: adirePattern(color), backgroundSize: '64px 64px', opacity }} />);

}
