import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookCard from '../components/BookCard';

describe('BookCard Component', () => {
  // mock data
  const mockBook = {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    cover: 'http://example.com/cover.jpg'
  };

  const mockOnDelete = vi.fn();

  beforeEach(() => {
    // 1. define window.alert manually because happy-dom doesnt have it
    window.alert = vi.fn();
    
    // 2. mock global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // clean up the alert mock
    delete window.alert; 
  });

  it('renders book information correctly', () => {
    render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    expect(screen.getByText('F. Scott Fitzgerald')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockBook.cover);
  });

  it('calls delete API when delete button is clicked', async () => {
    // setup fetch mock to return success
    global.fetch.mockResolvedValue({ ok: true });

    render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

    // find and click the button
    const deleteBtn = screen.getByText(/Delete Book/i);
    fireEvent.click(deleteBtn);

    // check if fetch was called with correct URL (DELETE request)
    // checking stringContaining because VITE_API_URL might vary
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/books/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});