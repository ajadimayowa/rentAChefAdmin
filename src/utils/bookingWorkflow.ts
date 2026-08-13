import {
  Archive,
  CalendarRange,
  ChefHat,
  Home,
  PartyPopper,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon } from
'lucide-react';

// Mirrors platform/domain/enums.ts BookingWorkflow on the backend — the 8 booking
// workflows a customer can go through, each with its own bookingData shape and
// therefore its own admin page (see pages/admin/bookings).
export const BOOKING_WORKFLOWS = {
  ALASE_SERVICE: 'ALASE_SERVICE',
  DAILY_CHEF: 'DAILY_CHEF',
  DATE_NIGHT: 'DATE_NIGHT',
  DINNER_PARTY: 'DINNER_PARTY',
  EVENT_CATERING: 'EVENT_CATERING',
  STORAGE_PACKAGE: 'STORAGE_PACKAGE',
  SPECIAL_SERVICE: 'SPECIAL_SERVICE',
  HOME_RESIDENCE: 'HOME_RESIDENCE'
} as const;

export type BookingWorkflowCode = typeof BOOKING_WORKFLOWS[keyof typeof BOOKING_WORKFLOWS];

export const BOOKING_WORKFLOW_LABELS: Record<BookingWorkflowCode, string> = {
  ALASE_SERVICE: 'Alase Service',
  DAILY_CHEF: 'Daily Chef',
  DATE_NIGHT: 'Date Night',
  DINNER_PARTY: 'Dinner Party',
  EVENT_CATERING: 'Event Catering',
  STORAGE_PACKAGE: 'Storage Package',
  SPECIAL_SERVICE: 'Special Service',
  HOME_RESIDENCE: 'Home Residence'
};

export function formatWorkflowLabel(workflow?: string | null): string {
  if (!workflow) return 'Booking';
  return BOOKING_WORKFLOW_LABELS[workflow as BookingWorkflowCode] ?? workflow.
  toLowerCase().
  split('_').
  map((part) => part.charAt(0).toUpperCase() + part.slice(1)).
  join(' ');
}

export interface WorkflowTheme {
  icon: LucideIcon;
  routeSlug: string;
}

/**
 * Route slug + hero icon per workflow. Deliberately colorless — every booking
 * detail page shares one constant dark theme (see BOOKING_ACCENT below) rather
 * than a different hue per workflow, only the icon and copy vary.
 */
export const WORKFLOW_THEME: Record<BookingWorkflowCode, WorkflowTheme> = {
  ALASE_SERVICE: { icon: ChefHat, routeSlug: 'alase-service' },
  DAILY_CHEF: { icon: UtensilsCrossed, routeSlug: 'daily-chef' },
  DATE_NIGHT: { icon: Wine, routeSlug: 'date-night' },
  DINNER_PARTY: { icon: PartyPopper, routeSlug: 'dinner-party' },
  EVENT_CATERING: { icon: CalendarRange, routeSlug: 'event-catering' },
  STORAGE_PACKAGE: { icon: Archive, routeSlug: 'storage-package' },
  SPECIAL_SERVICE: { icon: Sparkles, routeSlug: 'special-service' },
  HOME_RESIDENCE: { icon: Home, routeSlug: 'home-residence' }
};

export const UNKNOWN_WORKFLOW_ROUTE_SLUG = 'general';

/** The route segment a booking should navigate to — falls back to a generic page for anything without a known workflow. */
export function workflowRouteSlug(workflow?: string | null): string {
  const theme = workflow ? WORKFLOW_THEME[workflow as BookingWorkflowCode] : undefined;
  return theme?.routeSlug ?? UNKNOWN_WORKFLOW_ROUTE_SLUG;
}

export function workflowTheme(workflow?: string | null): WorkflowTheme | undefined {
  return workflow ? WORKFLOW_THEME[workflow as BookingWorkflowCode] : undefined;
}

/** The single, constant dark treatment every booking page's hero and accent badges use — no per-workflow colors. */
export const BOOKING_HERO_GRADIENT = 'from-ink-900 via-ink-950 to-black';
/** Accent badge style for the icon on each detail card header — dark, on the cards' white background. */
export const BOOKING_ACCENT_CLASSNAME = 'bg-ink-900 text-white';
