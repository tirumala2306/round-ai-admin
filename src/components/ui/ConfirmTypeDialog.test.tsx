import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmTypeDialog } from './ConfirmTypeDialog';

describe('ConfirmTypeDialog', () => {
  it('requires exact confirm word before enabling action', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmTypeDialog
        open
        title="Disable AI"
        description="Type DISABLE"
        confirmWord="DISABLE"
        onConfirm={onConfirm}
        onClose={() => undefined}
      />,
    );

    const btn = screen.getByRole('button', { name: 'Confirm' });
    expect(btn).toBeDisabled();
    await user.type(screen.getByLabelText(/type/i), 'DISABLE');
    expect(btn).toBeEnabled();
    await user.click(btn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ConfirmTypeDialog
        open
        title="Disable AI"
        description="Type DISABLE"
        confirmWord="DISABLE"
        onConfirm={() => undefined}
        onClose={onClose}
      />,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
