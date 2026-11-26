import { useState } from 'react';
import { useField } from 'formik';
import { Plus, X } from 'lucide-react';

const MAX_ATTRIBUTES = 10;
const MAX_LENGTH = 40;

/**
 * Ordered list of menu attributes (courses / features), e.g. Starter · Main · Dessert.
 * Pick a suggestion or type your own; the order shown is the order customers see.
 */
export function MenuAttributesField({
  name,
  label,
  hint,
  suggestions



}: {name: string;label: string;hint?: string;suggestions: string[];}) {
  const [field, meta, helpers] = useField<string[]>(name);
  const [draft, setDraft] = useState('');
  const values = field.value ?? [];
  const has = (text: string) => values.some((v) => v.toLowerCase() === text.toLowerCase());
  const full = values.length >= MAX_ATTRIBUTES;

  const add = (raw: string) => {
    const text = raw.trim().slice(0, MAX_LENGTH);
    if (!text || has(text) || full) return;
    helpers.setValue([...values, text]);
    helpers.setTouched(true, false);
  };

  const remove = (index: number) => helpers.setValue(values.filter((_, i) => i !== index));

  return (
    <div>
      <label htmlFor={`${name}-input`} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>

      {values.length ?
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {values.map((v, i) =>
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-full bg-ink-950 py-1 pl-3 pr-1.5 text-xs font-medium text-white">

              {v}
              <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove ${v}`}
            className="rounded-full p-0.5 text-white/70 hover:bg-white/15 hover:text-white">

                <X className="h-3 w-3" />
              </button>
            </span>
        )}
          <span className="ml-1 text-xs text-ink-500">{values.join(' · ')}</span>
        </div> :
      null}

      <div className="flex gap-2">
        <input
          id={`${name}-input`}
          type="text"
          value={draft}
          maxLength={MAX_LENGTH}
          disabled={full}
          placeholder={full ? `Up to ${MAX_ATTRIBUTES} attributes` : 'Type an attribute and press Enter'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
              setDraft('');
            }
          }}
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25 disabled:bg-ink-50" />

        <button
          type="button"
          disabled={!draft.trim() || full}
          onClick={() => {
            add(draft);
            setDraft('');
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">

          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestions.filter((s) => !has(s)).map((s) =>
        <button
          key={s}
          type="button"
          disabled={full}
          onClick={() => add(s)}
          className="rounded-full border border-dashed border-ink-300 px-2.5 py-1 text-xs font-medium text-ink-600 hover:border-ink-500 hover:text-ink-900 disabled:opacity-50">

            + {s}
          </button>
        )}
      </div>

      {hint ? <p className="mt-1.5 text-xs text-ink-500">{hint}</p> : null}
      {meta.touched && typeof meta.error === 'string' ? <p className="mt-1 text-xs font-medium text-red-600">{meta.error}</p> : null}
    </div>);

}
