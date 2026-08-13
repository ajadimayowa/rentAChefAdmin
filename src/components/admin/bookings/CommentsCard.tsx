import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Card, CardHeader } from '../../ui/Card';
import type { BookingComment } from '../../../services/booking/bookingServices';

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function CommentsCard({ comments }: {comments?: BookingComment[];}) {
  const items = comments ?? [];
  return (
    <Card>
      <CardHeader
        title="Comments"
        description="Internal admin notes on this booking"
        action={<MessageSquare className="h-4 w-4 text-ink-300" />} />

      {items.length > 0 ?
      <ul className="divide-y divide-ink-100">
          {items.
        slice().
        reverse().
        map((c, i) =>
        <li key={i} className="flex items-start gap-3 px-5 py-3.5 text-sm">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 font-heading text-xs font-semibold text-ink-600">
                  {initials(c.authorName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="font-medium text-ink-900">{c.authorName || 'Admin'}</p>
                    <p className="text-xs text-ink-400">{formatTimestamp(c.createdAt)}</p>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-ink-700">{c.text}</p>
                </div>
              </li>
        )}
        </ul> :

      <p className="px-5 py-6 text-sm text-ink-500">No comments yet.</p>
      }
    </Card>);

}
