import React from 'react';
import { Search } from 'lucide-react';

export function Toolbar({
  search,
  onSearch,
  placeholder = 'Search…',
  children





}: {search: string;onSearch: (value: string) => void;placeholder?: string;children?: React.ReactNode;}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink-200/80 px-5 py-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25" />
        
      </div>
      {children}
    </div>);

}

export function FilterSelect({
  value,
  onChange,
  options,
  label





}: {value: string;onChange: (value: string) => void;options: {value: string;label: string;}[];label: string;}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-800 focus:border-buttons focus:outline-none focus:ring-2 focus:ring-buttons/25">
      
      {options.map((opt) =>
      <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      )}
    </select>);

}