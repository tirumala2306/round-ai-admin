import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
