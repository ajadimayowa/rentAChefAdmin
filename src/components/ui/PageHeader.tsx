import React from 'react';

export function PageHeader({
  title,
  description,
  action




}: {title: string;description: string;action?: React.ReactNode;}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-950">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">{description}</p>
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </header>);

}