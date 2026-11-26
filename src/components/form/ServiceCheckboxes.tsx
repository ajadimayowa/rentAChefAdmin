/** Checkbox list of services with select all / clear — used by fees and menus. */
export interface ServiceOption {
  id: string;
  name: string;
}

export function ServiceCheckboxes({
  services,
  selected,
  onChange,
  error,
  label = 'Applies to services'
}: {services: ServiceOption[];selected: string[];onChange: (ids: string[]) => void;error?: string;label?: string;}) {
  const chosen = new Set(selected);
  const allChosen = services.length > 0 && services.every((s) => chosen.has(s.id));
  const toggle = (id: string) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);else next.add(id);
    onChange([...next]);
  };

  return (
    <fieldset>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <legend className="text-sm font-medium text-ink-800">
          {label} <span className="font-normal text-ink-500">({selected.length} selected)</span>
        </legend>
        {services.length ?
        <button
          type="button"
          onClick={() => onChange(allChosen ? [] : services.map((s) => s.id))}
          className="text-xs font-medium text-buttons hover:underline">

            {allChosen ? 'Clear all' : 'Select all'}
          </button> :
        null}
      </div>
      {services.length === 0 ?
      <p className="rounded-lg border border-dashed border-ink-200 px-4 py-3 text-sm text-ink-500">
          No services found. Create a service first.
        </p> :

      <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-ink-200 p-2 sm:grid-cols-2">
          {services.map((s) =>
        <label
          key={s.id}
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink-800 hover:bg-ink-50">

              <input
            type="checkbox"
            checked={chosen.has(s.id)}
            onChange={() => toggle(s.id)}
            className="h-4 w-4 rounded border-ink-300 text-buttons focus:ring-buttons/40" />

              <span className="min-w-0 truncate">{s.name}</span>
            </label>
        )}
        </div>
      }
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
    </fieldset>);

}
