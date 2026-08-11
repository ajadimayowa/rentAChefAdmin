import React from 'react';
import { PageHeader } from './PageHeader';

export function ComingSoon({ title }: {title: string;}) {
  return (
    <div>
      <PageHeader title={title} description="This section is coming soon." />
      <div className="rounded-xl border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
        We're still building this out. Check back soon.
      </div>
    </div>);

}
