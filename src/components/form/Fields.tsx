import React, { useEffect, useRef, useState } from 'react';
import { useField } from 'formik';
import { ChevronDown, ImageOff, X } from 'lucide-react';

const baseInput =
'w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-ink-50';
const okBorder = 'border-ink-200 focus:border-buttons focus:ring-buttons/25';
const errBorder = 'border-red-300 focus:border-red-400 focus:ring-red-200';

function Wrapper({
  label,
  name,
  hint,
  error,
  touched,
  children,
  className = ''








}: {label: string;name: string;hint?: string;error?: string;touched?: boolean;children: React.ReactNode;className?: string;}) {
  const showError = Boolean(touched && error);
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>
      {children}
      {showError ?
      <p className="mt-1 text-xs font-medium text-red-600">{error}</p> :
      hint ?
      <p className="mt-1 text-xs text-ink-400">{hint}</p> :
      null}
    </div>);

}

interface BaseProps {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  className?: string;
}

export function TextField({
  type = 'text',
  ...props
}: BaseProps & {type?: string;}) {
  const [field, meta] = useField(props.name);
  const bad = Boolean(meta.touched && meta.error);
  return (
    <Wrapper {...props} error={meta.error} touched={meta.touched}>
      <input
        {...field}
        id={props.name}
        type={type}
        placeholder={props.placeholder}
        value={field.value ?? ''}
        className={`${baseInput} ${bad ? errBorder : okBorder}`} />
      
    </Wrapper>);

}

export function NumberField({
  step = 'any',
  prefix,
  ...props
}: BaseProps & {step?: string;prefix?: string;}) {
  const [field, meta, helpers] = useField(props.name);
  const bad = Boolean(meta.touched && meta.error);
  return (
    <Wrapper {...props} error={meta.error} touched={meta.touched}>
      <div className="relative">
        {prefix ?
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
            {prefix}
          </span> :
        null}
        <input
          id={props.name}
          name={props.name}
          type="number"
          step={step}
          placeholder={props.placeholder}
          onBlur={field.onBlur}
          value={field.value ?? ''}
          onChange={(e) =>
          helpers.setValue(e.target.value === '' ? '' : Number(e.target.value))
          }
          className={`${baseInput} ${bad ? errBorder : okBorder} ${prefix ? 'pl-7' : ''}`} />
        
      </div>
    </Wrapper>);

}

export function TextAreaField({ rows = 3, ...props }: BaseProps & {rows?: number;}) {
  const [field, meta] = useField(props.name);
  const bad = Boolean(meta.touched && meta.error);
  return (
    <Wrapper {...props} error={meta.error} touched={meta.touched}>
      <textarea
        {...field}
        id={props.name}
        rows={rows}
        placeholder={props.placeholder}
        value={field.value ?? ''}
        className={`${baseInput} resize-y ${bad ? errBorder : okBorder}`} />
      
    </Wrapper>);

}

export function SelectField({
  options,
  ...props
}: BaseProps & {options: {value: string;label: string;}[];}) {
  const [field, meta] = useField(props.name);
  const bad = Boolean(meta.touched && meta.error);
  return (
    <Wrapper {...props} error={meta.error} touched={meta.touched}>
      <select
        {...field}
        id={props.name}
        value={field.value ?? ''}
        className={`${baseInput} ${bad ? errBorder : okBorder}`}>
        
        <option value="">Select…</option>
        {options.map((o) =>
        <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )}
      </select>
    </Wrapper>);

}

export interface SearchSelectOption {
  id: string;
  label: string;
}

export function SearchSelectField({
  id,
  name,
  label,
  data,
  hint,
  placeholder = 'Search…',
  disabled = false,
  className,
  onSelect
}: {
  id: string;
  name: string;
  label: string;
  data: SearchSelectOption[];
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSelect?: (option: SearchSelectOption | null) => void;
}) {
  const [field, meta, helpers] = useField<string>(name);
  const bad = Boolean(meta.touched && meta.error);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = data.find((o) => o.id === field.value) ?? null;
  const filtered = query.trim() ?
  data.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) :
  data;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const choose = (option: SearchSelectOption) => {
    helpers.setValue(option.id);
    helpers.setTouched(true);
    setQuery('');
    setOpen(false);
    onSelect?.(option);
  };

  const clear = () => {
    helpers.setValue('');
    helpers.setTouched(true);
    onSelect?.(null);
  };

  return (
    <Wrapper name={name} label={label} hint={hint} error={meta.error} touched={meta.touched} className={className}>
      <div className="relative" ref={containerRef}>
        <input
          id={id}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={selected ? selected.label : placeholder}
          value={open ? query : ''}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onBlur={() => helpers.setTouched(true)}
          className={`${baseInput} pr-9 ${bad ? errBorder : okBorder} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`} />

        {selected && !open ?
        <button
          type="button"
          onClick={clear}
          disabled={disabled}
          aria-label="Clear selection"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">

            <X className="h-4 w-4" />
          </button> :

        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        }
        {open ?
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-ink-200 bg-white py-1 shadow-lg">
            {filtered.length ?
          filtered.map((o) =>
          <button
            key={o.id}
            type="button"
            onClick={() => choose(o)}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-ink-50 ${
            o.id === field.value ? 'bg-ink-50 font-medium text-ink-950' : 'text-ink-700'}`
            }>

                  {o.label}
                </button>
          ) :

          <p className="px-3 py-2 text-sm text-ink-400">No matches</p>
          }
          </div> :
        null}
      </div>
    </Wrapper>);

}

export function MultiSelectField({
  options,
  ...props
}: BaseProps & {options: {value: string;label: string;}[];}) {
  const [field, meta, helpers] = useField<string[]>(props.name);
  const selected = field.value ?? [];
  const toggle = (value: string) => {
    helpers.setTouched(true);
    helpers.setValue(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };
  return (
    <Wrapper {...props} error={meta.error as string} touched={meta.touched}>
      <div className="flex flex-wrap gap-2 rounded-lg border border-ink-200 bg-white p-2">
        {options.map((o) => {
          const on = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              aria-pressed={on}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              on ?
              'bg-ink-950 text-white' :
              'bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900'}`
              }>
              
              {o.label}
            </button>);

        })}
      </div>
    </Wrapper>);

}

export interface MultiSelectOption {
  value: string;
  label: string;
}

export function MultiSelectSearchField({
  options,
  placeholder = 'Select…',
  disabled = false,
  ...props
}: BaseProps & {options: MultiSelectOption[];disabled?: boolean;}) {
  const [field, meta, helpers] = useField<string[]>(props.name);
  const selected = field.value ?? [];
  const bad = Boolean(meta.touched && meta.error);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((o) => selected.includes(o.value));
  const filtered = query.trim() ?
  options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) :
  options;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        helpers.setTouched(true);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (value: string) => {
    helpers.setValue(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  const remove = (value: string) => {
    helpers.setValue(selected.filter((v) => v !== value));
    helpers.setTouched(true);
  };

  const clearAll = () => {
    helpers.setValue([]);
    helpers.setTouched(true);
  };

  return (
    <Wrapper {...props} error={meta.error as string} touched={meta.touched}>
      <div className="relative" ref={containerRef}>
        <input
          id={props.name}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={
            open ? 'Search…' : selectedOptions.length ? `${selectedOptions.length} selected` : placeholder
          }
          value={open ? query : ''}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className={`${baseInput} pr-9 ${bad ? errBorder : okBorder} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`} />

        {selectedOptions.length && !open ?
        <button
          type="button"
          onClick={clearAll}
          disabled={disabled}
          aria-label="Clear all selections"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">

            <X className="h-4 w-4" />
          </button> :

        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        }
        {open ?
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-ink-200 bg-white py-1 shadow-lg">
            {filtered.length ?
          filtered.map((o) => {
            const on = selected.includes(o.value);
            return (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-ink-50">

                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(o.value)}
                  className="h-4 w-4 shrink-0 rounded border-ink-300 text-buttons focus:ring-buttons/40" />

                <span className={on ? 'font-medium text-ink-950' : 'text-ink-700'}>{o.label}</span>
              </label>);

          }) :

          <p className="px-3 py-2 text-sm text-ink-400">No matches</p>
          }
          </div> :
        null}
      </div>
      {selectedOptions.length ?
      <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedOptions.map((o) =>
        <span
          key={o.value}
          className="inline-flex items-center gap-1 rounded-full bg-ink-100 py-1 pl-3 pr-1.5 text-xs font-medium text-ink-700">

              {o.label}
              <button
            type="button"
            onClick={() => remove(o.value)}
            disabled={disabled}
            aria-label={`Remove ${o.label}`}
            className="rounded-full p-0.5 text-ink-400 hover:bg-ink-200 hover:text-ink-900">

                <X className="h-3 w-3" />
              </button>
            </span>
        )}
        </div> :
      null}
    </Wrapper>);

}

export function TagsField(props: BaseProps) {
  const [field, meta, helpers] = useField<string[]>(props.name);
  const value = (field.value ?? []).join(', ');
  return (
    <Wrapper {...props} error={meta.error as string} touched={meta.touched}>
      <input
        id={props.name}
        type="text"
        placeholder={props.placeholder}
        value={value}
        onBlur={() => helpers.setTouched(true)}
        onChange={(e) =>
        helpers.setValue(
          e.target.value.
          split(',').
          map((v) => v.trimStart()).
          filter((v, i, arr) => v !== '' || i === arr.length - 1)
        )
        }
        className={`${baseInput} ${okBorder}`} />
      
    </Wrapper>);

}

export function ImageField({
  name,
  label,
  hint,
  previewUrl,
  className
}: BaseProps & {previewUrl?: string;}) {
  const [field, meta, helpers] = useField<File | null>(name);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!field.value) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(field.value);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [field.value]);

  const displaySrc = objectUrl ?? previewUrl;

  return (
    <Wrapper name={name} label={label} hint={hint} error={meta.error} touched={meta.touched} className={className}>
      <div className="flex items-center gap-4">
        {displaySrc ?
        <img src={displaySrc} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" /> :

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-400">
            <ImageOff className="h-5 w-5" />
          </div>
        }
        <div className="flex items-center gap-3">
          <label
            htmlFor={name}
            className="inline-flex cursor-pointer items-center rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50">

            Choose photo
          </label>
          <input
            id={name}
            name={name}
            type="file"
            accept="image/*"
            className="hidden"
            onBlur={field.onBlur}
            onChange={(e) => helpers.setValue(e.currentTarget.files?.[0] ?? null)} />

          {field.value ?
          <button
            type="button"
            onClick={() => helpers.setValue(null)}
            className="text-xs font-medium text-ink-500 hover:text-red-600">

              Remove
            </button> :
          null}
        </div>
      </div>
    </Wrapper>);

}

export function SwitchField({ label, name, hint }: {label: string;name: string;hint?: string;}) {
  const [field,, helpers] = useField(name);
  const on = field.value === 'active' || field.value === true;
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-ink-200 bg-ink-50/50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink-800">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-ink-500">{hint}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => helpers.setValue(on ? 'inactive' : 'active')}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? 'bg-buttons' : 'bg-ink-300'}`
        }>
        
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-[22px]' : 'left-0.5'}`
          } />
        
      </button>
    </div>);

}

export function CheckboxField({
  name,
  label,
  hint




}: {name: string;label: string;hint?: string;}) {
  const [field,, helpers] = useField<boolean>(name);
  const checked = Boolean(field.value);
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 bg-ink-50/50 px-4 py-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => helpers.setValue(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-ink-300 text-buttons focus:ring-buttons/40" />
      
      <span>
        <span className="block text-sm font-medium text-ink-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>);

}

export function FormGrid({ children }: {children: React.ReactNode;}) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

export function FieldSectionTitle({ children }: {children: React.ReactNode;}) {
  return (
    <h4 className="font-heading text-xs font-semibold uppercase tracking-wide text-ink-400">
      {children}
    </h4>);

}