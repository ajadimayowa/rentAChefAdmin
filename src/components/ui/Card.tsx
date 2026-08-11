import React from 'react';

export function Card({
  className = '',
  children



}: {className?: string;children: React.ReactNode;}) {
  return (
    <div className={`rounded-xl border border-ink-200/80 bg-white shadow-card ${className}`}>
      {children}
    </div>);

}

export function CardHeader({
  title,
  description,
  action




}: {title: string;description?: string;action?: React.ReactNode;}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-200/80 px-5 py-4">
      <div>
        <h3 className="font-heading text-[15px] font-semibold text-ink-950">{title}</h3>
        {description ? <p className="mt-0.5 text-sm text-ink-500">{description}</p> : null}
      </div>
      {action}
    </div>);

}