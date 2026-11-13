import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90',
  secondary: 'border border-[var(--border)] bg-[var(--card)] hover:bg-[color-mix(in_oklab,var(--fg)_4%,var(--card))]',
  danger: 'bg-[var(--danger)] text-white hover:opacity-90',
  ghost: 'hover:bg-[color-mix(in_oklab,var(--fg)_6%,transparent)]',
} as const;

type Variant = keyof typeof variants;

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
