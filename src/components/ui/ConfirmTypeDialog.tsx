import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

type Props = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmWord: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  /** Extra fields (e.g. reason) rendered above the type-to-confirm input. */
  children?: ReactNode;
  /** When false, confirm stays disabled even if the word matches. */
  extraValid?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmTypeDialog({
  open,
  title,
  description,
  confirmWord,
  confirmLabel = 'Confirm',
  danger,
  busy,
  children,
  extraValid = true,
  onConfirm,
  onClose,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'input:not([disabled]),textarea:not([disabled]),button:not([disabled]),select:not([disabled]),[href]',
    );
    focusable?.focus();
    return () => {
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const matched = typed.trim() === confirmWord;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (!busy && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div id={descId} className="mt-2 text-sm text-[var(--muted)]">{description}</div>
        {children ? <div className="mt-4 space-y-3">{children}</div> : null}
        <div className="mt-4">
          <Label htmlFor="confirm-type">
            Type <span className="font-mono text-[var(--fg)]">{confirmWord}</span> to confirm
          </Label>
          <Input
            id="confirm-type"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            aria-required="true"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            disabled={!matched || !extraValid || busy}
            onClick={() => void onConfirm()}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
