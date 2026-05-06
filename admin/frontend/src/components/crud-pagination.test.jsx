import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CrudPagination } from './crud-pagination';

describe('CrudPagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <CrudPagination meta={{ last_page: 1 }} page={1} onPageChange={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('changes to a numbered page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<CrudPagination meta={{ last_page: 3 }} page={1} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: '2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('changes to previous and next pages', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<CrudPagination meta={{ last_page: 3 }} page={2} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: /previous/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });
});
