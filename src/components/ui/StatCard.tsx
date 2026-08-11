import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon






}: {label: string;value: string;delta?: number;hint?: string;icon: React.ReactNode;}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-ink-200/80 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-buttons/15 text-amber-700">
          {icon}
        </span>
      </div>
      <p className="mt-3 font-heading text-2xl font-semibold tracking-tight text-ink-950">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof delta === 'number' ?
        <span
          className={`inline-flex items-center gap-0.5 font-medium ${
          positive ? 'text-emerald-600' : 'text-red-600'}`
          }>
          
            {positive ?
          <ArrowUpRight className="h-3.5 w-3.5" /> :

          <ArrowDownRight className="h-3.5 w-3.5" />
          }
            {Math.abs(delta)}%
          </span> :
        null}
        {hint ? <span className="text-ink-400">{hint}</span> : null}
      </div>
    </div>);

}