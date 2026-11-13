import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const tones = {
  neutral: 'bg-[color-mix(in_oklab,var(--muted)_18%,transparent)] text-[var(--fg)]',
  ok: 'bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent)]',
  warn: 'bg-[color-mix(in_oklab,var(--warn)_18%,transparent)] text-[var(--warn)]',
  danger: 'bg-[color-mix(in_oklab,var(--danger)_18%,transparent)] text-[var(--danger)]',
} as const;

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn('inline-flex rounded px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  );
}
