import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BulkActionsBar } from './bulk-actions-bar';

describe('BulkActionsBar', () => {
  it('renders nothing when no items are selected', () => {
    const { container } = render(
      <BulkActionsBar selectedCount={0} onDelete={vi.fn()} onClear={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the selected item count', () => {
    render(<BulkActionsBar selectedCount={3} onDelete={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByText('3 seleccionado(s)')).toBeInTheDocument();
  });

  it('clears the current selection', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(<BulkActionsBar selectedCount={2} onDelete={vi.fn()} onClear={onClear} />);
    await user.click(screen.getByRole('button', { name: /limpiar/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('confirms bulk delete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<BulkActionsBar selectedCount={2} onDelete={onDelete} onClear={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /eliminar seleccionados/i }));
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
