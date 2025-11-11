import { jest } from '@jest/globals';
import { fetchBooks } from '../controllers/bookController.js'; // <-- Path changed

// --- Mock the global 'fetch' function ---
// This replaces the built-in 'fetch' with our mock
global.fetch = jest.fn();

// --- Start the Tests ---
describe('Book Controller (Open Library)', () => {
  
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    return res;
  };

  beforeEach(() => {
    // Clear the mock implementation and call history
    global.fetch.mockClear();
    jest.clearAllMocks();
  });

  it('should fetch and format books from Open Library', async () => {
    // Arrange
    const fakeApiData = {
      numFound: 1,
      docs: [
        {
          title: 'Test Book',
          author_name: ['Author One', 'Author Two'], // Test array handling
          first_publish_year: 1999,
          cover_i: 12345,
          number_of_pages_median: 300
        }
      ]
    };
    const req = { params: { bookName: 'test book' } };
    const res = mockResponse();

    // Tell our mock 'fetch' what to return
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => fakeApiData,
    });

    // Act
    await fetchBooks(req, res);

    // Assert
    // Check if 'fetch' was called with the correct, encoded URL
    expect(global.fetch).toHaveBeenCalledWith(
      'https://openlibrary.org/search.json?title=test%20book'
    );

    // Check if our controller sent the *formatted* data
    expect(res.json).toHaveBeenCalledWith({
      searchTerm: 'test book',
      totalResults: 1,
      books: [
        {
          title: 'Test Book',
          author: 'Author One', // Correctly picked the first author
          year: 1999,
          cover: 'https://covers.openlibrary.org/b/id/12345-M.jpg', // Correctly built cover URL
          pages: 300
        }
      ]
    });
  });

  it('should handle an API error gracefully', async () => {
    // Add this line to "mute" console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Arrange
    const req = { params: { bookName: 'test book' } };
    const res = mockResponse();

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500
    });

    // Act
    await fetchBooks(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch books',
      message: 'Open Library API error: 500'
    });

    // Add this line to restore console.error
    consoleErrorSpy.mockRestore();
  });
});