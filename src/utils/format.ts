export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

export const NAIRA = '₦';

/**
 * Naira currency formatter — mirrors the mobile app's `convertToThousand` helper
 * (comma-grouped, no decimals, ₦-prefixed) so amounts read the same across apps.
 */
export function convertToThousand(value: number | string | null | undefined): string {
  const amount = value ? Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 0;
  return `${NAIRA}${amount}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function groceryTotal(items: {quantity: number;unitCost: number;}[]): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
}

export function titleCase(value: string): string {
  return value.
  split('_').
  map((part) => part.charAt(0).toUpperCase() + part.slice(1)).
  join(' ');
}

export function slugify(value: string): string {
  return value.
  toLowerCase().
  trim().
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-|-$/g, '');
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}