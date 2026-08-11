import React from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  brand: 'bg-buttons/15 text-amber-800 ring-buttons/40'
};

export function Badge({
  tone = 'neutral',
  children



}: {tone?: BadgeTone;children: React.ReactNode;}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>
      
      {children}
    </span>);

}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'approved':
    case 'active':
    case 'completed':
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'in_progress':
      return 'info';
    case 'suspended':
    case 'rejected':
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
}