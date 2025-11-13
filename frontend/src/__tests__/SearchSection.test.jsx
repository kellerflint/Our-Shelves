import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Needed for <Link>
import SearchSection from '../components/SearchSection';

describe('SearchSection Component', () => {
  const mockSetSelectedBook = vi.fn();

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search input and button', () => {
    render(
      <MemoryRouter>
        <SearchSection setSelectedBook={mockSetSelectedBook} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Search by title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('fetches books when search is submitted', async () => {
    render(
      <MemoryRouter>
        <SearchSection setSelectedBook={mockSetSelectedBook} />
      </MemoryRouter>
    );

    // mock the API response
    const mockResponse = {
      searchTerm: 'Dune',
      totalResults: 1,
      books: [
        { title: 'Dune', author: 'Frank Herbert', year: 1965, cover: 'dune.jpg' }
      ]
    };
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    // 1. type into the input
    const input = screen.getByPlaceholderText(/Search by title/i);
    fireEvent.change(input, { target: { value: 'Dune' } });

    // 2. click the search button
    const button = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(button);

    // 3. verify fetch was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/books/search/Dune')
    );

    // 4. verify results appear (Wait for async update)
    await waitFor(() => {
      expect(screen.getByText('Search Results for "Dune"')).toBeInTheDocument();
      expect(screen.getByText('Dune')).toBeInTheDocument();
    });
  });
});