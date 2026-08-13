import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader } from '../../ui/Card';
import { renderValue } from './bookingFieldUtils';

export interface WorkflowField {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}

export function WorkflowFieldsCard({
  title,
  description,
  fields,
  accentIcon: AccentIcon,
  accentClassName,
  children




}: {title: string;description?: string;fields?: WorkflowField[];accentIcon?: LucideIcon;accentClassName?: string;children?: React.ReactNode;}) {
  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        action={
        AccentIcon ?
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accentClassName ?? 'bg-ink-100 text-ink-500'}`}>
              <AccentIcon className="h-4 w-4" />
            </span> :
        undefined
        } />

      {fields && fields.length > 0 &&
      <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-2">
          {fields.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={`${f.label}-${i}`}
                className="flex items-start justify-between gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-ink-50">

                <div className="flex shrink-0 items-center gap-2.5 text-ink-500">
                  {Icon &&
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500">
                      <Icon className="h-4 w-4" />
                    </span>
                }
                  <span className="text-sm">{f.label}</span>
                </div>
                <div className="min-w-0 max-w-[60%] break-words text-right text-sm font-medium text-ink-900">
                  {typeof f.value === 'string' || typeof f.value === 'number' ?
                renderValue(f.value) :
                f.value}
                </div>
              </div>);

          })}
        </div>
      }
      {children}
    </Card>);

}
