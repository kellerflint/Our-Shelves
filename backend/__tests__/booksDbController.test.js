import { jest } from '@jest/globals';
import { getBookById } from '../controllers/booksDbController.js'; // <-- Path changed
import db from '../db.js'; // <-- This import is for the mock setup

// --- Mock the Database ---
// The path is relative to *this file*, so '../db.js' is correct.
jest.mock('../db.js', () => ({
  default: { query: jest.fn() }
}));

// --- Start the Tests ---
describe('BookDB Controller', () => {
  // A helper function to create a mock Express response object
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn(() => res); // Use arrow fn to return 'res'
    res.json = jest.fn(() => res);   // Use arrow fn to return 'res'
    return res;
  };

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: The "Happy Path" (Book is found)
  it('should return a book when found', async () => {
    // Arrange
    const fakeBook = { id: 1, title: 'Test Book', author: 'Test Author' };
    const req = { params: { id: '1' } };
    const res = mockResponse();

    // Tell our mock DB to return the fake book
    // Note: mysql2 returns [rows, fields], so we wrap `fakeBook` in two arrays.
    db.query.mockResolvedValue([[fakeBook]]);

    // Act
    await getBookById(req, res);

    // Assert
    // Check if the DB was called with the correct SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = ?'), // Check if SQL is roughly correct
      ['1'] // Check if the correct ID was passed
    );

    // Check if the user received the correct JSON
    expect(res.json).toHaveBeenCalledWith(fakeBook);
  });

  // Test 2: The "Sad Path" (Book is not found)
  it('should handle an API error gracefully', async () => {
    // ---- Mute console.error ----
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

    // ---- Restore console.error ----
    consoleErrorSpy.mockRestore();
  });
});