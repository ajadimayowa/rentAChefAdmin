import React from 'react';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Try adjusting your filters, or create your first record.',
  onRowClick
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
          <Inbox className="h-6 w-6" />
        </div>
        <p className="mt-4 font-heading text-[15px] font-semibold text-ink-900">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-ink-500">{emptyDescription}</p>
      </div>);

  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50/70">
            {columns.map((col) =>
            <th
              key={col.key}
              scope="col"
              style={col.width ? { width: col.width } : undefined}
              className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 ${
              col.align === 'right' ?
              'text-right' :
              col.align === 'center' ?
              'text-center' :
              'text-left'}`
              }>
              
                {col.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
          <tr
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`border-b border-ink-100 last:border-0 transition-colors hover:bg-ink-50/60 ${
            onRowClick ? 'cursor-pointer' : ''}`
            }>
            
              {columns.map((col) =>
            <td
              key={col.key}
              className={`px-5 py-3.5 align-middle text-ink-800 ${
              col.align === 'right' ?
              'text-right' :
              col.align === 'center' ?
              'text-center' :
              'text-left'}`
              }>
              
                  {col.render(row)}
                </td>
            )}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}