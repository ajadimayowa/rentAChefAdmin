import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
  'bg-buttons text-ink-950 hover:bg-amber-600 hover:text-white focus-visible:outline-buttons',
  secondary:
  'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 focus-visible:outline-ink-400',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-ink-400',
  danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus-visible:outline-red-400',
  dark: 'bg-ink-950 text-white hover:bg-ink-800 focus-visible:outline-ink-800'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2'
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}>
      
      {icon}
      {children}
    </button>);

}