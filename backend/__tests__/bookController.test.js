import { jest } from '@jest/globals';
import { fetchBooks } from '../controllers/bookController.js';

// 1. mock the global 'fetch' API
global.fetch = jest.fn();

describe('Book Controller (Open Library API)', () => {
  let req, res;

  // setup before each test
  beforeEach(() => {
    jest.clearAllMocks(); // clear previous mock data
    req = { params: { bookName: 'test book' } };
    res = {
      status: jest.fn(() => res), // chainable .status()
      json: jest.fn()             // .json()
    };
  });

  it('should fetch books and return formatted data', async () => {
    // A. mock the successful API response
    const mockApiData = {
      numFound: 1,
      docs: [{ title: 'Test Title', author_name: ['Test Author'], first_publish_year: 2020 }]
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockApiData
    });

    // B. run the controller
    await fetchBooks(req, res);

    // C. assertions
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('openlibrary.org'));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalResults: 1,
      books: expect.arrayContaining([
        expect.objectContaining({ title: 'Test Title' })
      ])
    }));
  });

  it('should handle API errors gracefully', async () => {
    // silence the console.error for this test only
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // A. mock a failed API response
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    // B. run the controller
    await fetchBooks(req, res);

    // C. assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Failed to fetch books'
    }));

    consoleSpy.mockRestore(); // restore console logging
  });
});