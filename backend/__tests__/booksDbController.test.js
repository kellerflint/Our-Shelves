import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// 1. mock the DB module BEFORE importing anything else
jest.unstable_mockModule('../db.js', () => ({
  default: {
    query: jest.fn(),
    execute: jest.fn()
  }
}));

// 2. import modules dynamically AFTER the mock is set up
const { listBooks, createBook } = await import('../controllers/booksDbController.js');
const db = (await import('../db.js')).default;

// 3. start tests
describe('Books DB Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
  });

  describe('listBooks', () => {
    it('should return a list of books', async () => {
      const mockRows = [{ id: 1, title: 'Harry Potter' }];
      
      // mock 'query' to return rows
      db.query.mockResolvedValue([mockRows]);

      await listBooks(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockRows);
    });
  });

  describe('createBook', () => {
    it('should create a book and return 201', async () => {
      req.body = { title: 'New Book', author: 'Me' };
      
      // mock 'execute' for INSERT
      db.execute.mockResolvedValue([{ insertId: 10 }]);

      await createBook(req, res);

      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO books'),
        expect.any(Array)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 10,
        title: 'New Book'
      }));
    });

    it('should return 400 if title is missing', async () => {
      req.body = { author: 'Me' }; // no title

      await createBook(req, res);

      expect(db.execute).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});