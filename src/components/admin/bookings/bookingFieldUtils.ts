import { Beef, Drumstick, Fish, Utensils } from 'lucide-react';
import type { WorkflowField } from './WorkflowFieldsCard';

export const humanizeKey = (key: string): string =>
key.
replace(/([a-z0-9])([A-Z])/g, '$1 $2').
replace(/^./, (c) => c.toUpperCase());

export const renderValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/** bookingData entries not already surfaced by a workflow's explicit fields — keeps nothing hidden even if a field list falls behind the schema. */
export function remainingBookingDataEntries(
bookingData: Record<string, any> | undefined,
usedKeys: string[])
: [string, unknown][] {
  if (!bookingData) return [];
  const used = new Set(usedKeys);
  return Object.entries(bookingData).filter(([key, value]) => !used.has(key) && value !== undefined);
}

export interface ProteinSelection {
  fullCow?: number;
  halfCow?: number;
  ram?: number;
  chickenCartons?: number;
  fishCartons?: number;
}

interface ProteinOptionItem {
  label?: string;
  value?: string;
  count?: number;
}

const PROTEIN_META: Record<keyof ProteinSelection, {label: string;icon: WorkflowField['icon'];}> = {
  fullCow: { label: 'Full cow', icon: Beef },
  halfCow: { label: 'Half cow', icon: Beef },
  ram: { label: 'Ram', icon: Utensils },
  chickenCartons: { label: 'Chicken (cartons)', icon: Drumstick },
  fishCartons: { label: 'Fish (cartons)', icon: Fish }
};

const PROTEIN_ICON_BY_VALUE: Record<string, WorkflowField['icon']> = {
  fullCow: Beef,
  halfCow: Beef,
  ram: Utensils,
  chickenCarton: Drumstick,
  chickenCartons: Drumstick,
  fishCarton: Fish,
  fishCartons: Fish
};

/** bookingData keys the protein section reads — real bookings have used both an object shape (`proteinSelection`) and an array shape (`proteinOptions`), so both must be excluded from any "additional details" catch-all to avoid dumping raw JSON. */
export const PROTEIN_DATA_KEYS = ['proteinSelection', 'proteinOptions'];

/**
 * Shared across Alase/Dinner Party/Event Catering/Storage Package — the four
 * workflows that collect a protein order. Handles both shapes seen in the wild:
 * an object keyed by protein type (`proteinSelection`), or an array of
 * `{ label, value, count }` options (`proteinOptions`, matching the mobile app).
 * Only non-zero picks are shown once at least one exists, so a handful of
 * selections don't get buried in a wall of zeroed-out rows.
 */
export function proteinFields(bookingData: Record<string, any> | undefined): WorkflowField[] {
  if (!bookingData) return [];

  const selection = bookingData.proteinSelection;
  if (selection && typeof selection === 'object' && !Array.isArray(selection)) {
    const all = (Object.keys(PROTEIN_META) as (keyof ProteinSelection)[]).
    map((key) => ({ label: PROTEIN_META[key].label, value: selection[key] ?? 0, icon: PROTEIN_META[key].icon }));
    const picked = all.filter((f) => Number(f.value) > 0);
    return picked.length > 0 ? picked : all;
  }

  const options: ProteinOptionItem[] = Array.isArray(bookingData.proteinOptions) ? bookingData.proteinOptions : [];
  if (options.length > 0) {
    const all = options.map((opt, i) => ({
      label: opt?.label || humanizeKey(opt?.value || `Item ${i + 1}`),
      value: opt?.count ?? 0,
      icon: (opt?.value && PROTEIN_ICON_BY_VALUE[opt.value]) || Utensils
    }));
    const picked = all.filter((f) => Number(f.value) > 0);
    return picked.length > 0 ? picked : all;
  }

  return [];
}
