import React from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export function RowActions({
  onView,
  onEdit,
  onDelete,
  extra





}: {onView?: () => void;onEdit: () => void;onDelete?: () => void;extra?: React.ReactNode;}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {extra}
      {onView ?
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
        aria-label="View"
        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900">

          <Eye className="h-4 w-4" />
        </button> :
      null}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        aria-label="Edit"
        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900">
        
        <Pencil className="h-4 w-4" />
      </button>
      {onDelete ?
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete"
        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600">
        
          <Trash2 className="h-4 w-4" />
        </button> :
      null}
    </div>);

}