import request from 'supertest';
import express from 'express';
import db from '../db.js';
import {
    listBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} from '../controllers/booksDbController.js'

const app = express();
app.use(express.json());
app.get('/books', listBooks);
app.get('/books/id/:id', getBookById);
app.post('/books', createBook);
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);

describe('Books DB Controller Integration Tests', () => {

    // CLean up database before each test
    beforeEach(async () => {
        await db.execute('DELETE FROM books');
    });

    // Close database connection after all tests
    // afterAll(async () => {
    //     await db.end();
    // });

    describe('GET /books - listBooks', () => {
        
        it('should return empty array when no books exist', async () => {
            const response = await request(app)
                .get('/books')
                .expect('Content-type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toEqual([]);
        });

        it('should return all books from database', async () => {
            // Insert sample books
            await db.execute(
                'INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)',
                ['Test Book 1', 'Author 1', 'Fiction', 2020]
            );
            await db.execute(
                'INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)',
                ['Test Book 2', 'Author 2', 'Non-Fiction', 2021]
            );

            const response = await request(app)
                .get('/books')
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('title');
            expect(response.body[0]).toHaveProperty('author');
            expect(response.body[0]).toHaveProperty('genre');
            expect(response.body[0]).toHaveProperty('year');
        });

        it('should return books ordered by id DESC (newest first)', async () => {
            // Insert books in sequence
            const [result1] = await db.execute(
                'INSERT INTO books (title, author) VALUES (?, ?)',
                ['First Book', 'Author A']
            );
            const [result2] = await db.execute(
                'INSERT INTO books (title, author) VALUES (?, ?)',
                ['Second Book', 'Author B']
            );

            const response = await request(app)
                .get('/books')
                .expect(200);

            // Newest book (Second Book) should be first
            expect(response.body[0].title).toBe('Second Book');
            expect(response.body[1].title).toBe('First Book');
        });

        it('should include all book fields including timestamps', async () => {
            await db.execute(
                'INSERT INTO books (title, author, genre, description, year, cover) VALUES (?, ?, ?, ?, ?, ?)',
                ['Complete Book', 'Full Author', 'Mystery', 'A great book', 2022, 'http://example.com/cover.jpg']
            );

            const response = await request(app)
                .get('/books')
                .expect(200);

            const book = response.body[0];

            expect(book).toHaveProperty('id');
            expect(book).toHaveProperty('title', 'Complete Book');
            expect(book).toHaveProperty('author', 'Full Author');
            expect(book).toHaveProperty('genre', 'Mystery');
            expect(book).toHaveProperty('description', 'A great book');
            expect(book).toHaveProperty('year', 2022);
            expect(book).toHaveProperty('cover', 'http://example.com/cover.jpg');
            expect(book).toHaveProperty('createdAt');
        });
  });

  describe('GET /books/id/:id - getBookById', () => {
    
        it('should return a single book by id', async () => {
            
            const [result] = await db.execute(
                'INSERT INTO books (title, author, genre) VALUES (?, ?, ?)',
                ['Specific Book', 'Specific Author', 'Biography']
            );
            
            const bookId = result.insertId;

            const response = await request(app)
                .get(`/books/id/${bookId}`)
                .expect(200);

            expect(response.body).toHaveProperty('id', bookId);
            expect(response.body).toHaveProperty('title', 'Specific Book');
            expect(response.body).toHaveProperty('author', 'Specific Author');
            expect(response.body).toHaveProperty('genre', 'Biography');
        });

        it('should return 404 for non-existent book id', async () => {
            const response = await request(app)
                .get('/books/id/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Book not found');
        });

        it('should handle invalid id gracefully', async () => {
            const response = await request(app)
                .get('/books/id/invalid')
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });
  });

  describe('POST /books - createBook', () => {
    
        it('should create a new book with all fields', async () => {
            const newBook = {
                title: 'New Test Book',
                author: 'Test Author',
                genre: 'Science Fiction',
                description: 'An amazing sci-fi book',
                year: 2023,
                cover: 'http://example.com/cover.jpg'
            };

            const response = await request(app)
                .post('/books')
                .send(newBook)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('title', newBook.title);
            expect(response.body).toHaveProperty('author', newBook.author);
            expect(response.body).toHaveProperty('genre', newBook.genre);
            expect(response.body).toHaveProperty('description', newBook.description);
            expect(response.body).toHaveProperty('year', newBook.year);
            expect(response.body).toHaveProperty('cover', newBook.cover);

            // Verify book was actually inserted into database
            const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [response.body.id]);
            expect(rows).toHaveLength(1);
            expect(rows[0].title).toBe(newBook.title);
        });

        it('should create book with only required fields (title)', async () => {
            const minimalBook = {
                title: 'Minimal Book'
            };

            const response = await request(app)
                .post('/books')
                .send(minimalBook)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('title', 'Minimal Book');
        });

        it('should return 400 when title is missing', async () => {
            const invalidBook = {
                author: 'Author Without Title',
                genre: 'Mystery'
            };

            const response = await request(app)
                .post('/books')
                .send(invalidBook)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Title is required');
        });

        it('should handle null values for optional fields', async () => {
            const bookWithNulls = {
                title: 'Book with Nulls',
                author: null,
                genre: null,
                description: null,
                year: null,
                cover: null
            };

            const response = await request(app)
                .post('/books')
                .send(bookWithNulls)
                .expect(201);

            expect(response.body.title).toBe('Book with Nulls');
            expect(response.body.author).toBeNull();
            expect(response.body.genre).toBeNull();
        });

        it('should store book in database after creation', async () => {
            const newBook = {
                title: 'Database Test Book',
                author: 'DB Author'
            };

            const response = await request(app)
                .post('/books')
                .send(newBook)
                .expect(201);

            // Query database directly to verify
            const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [response.body.id]);
            expect(rows).toHaveLength(1);
            expect(rows[0].title).toBe(newBook.title);
            expect(rows[0].author).toBe(newBook.author);
        });
  });

  describe('PUT /books/:id - updateBook', () => {
    
        it('should update an existing book', async () => {
            // Create a book first
            const [result] = await db.execute(
                'INSERT INTO books (title, author, genre) VALUES (?, ?, ?)',
                ['Original Title', 'Original Author', 'Drama']
            );
            const bookId = result.insertId;

            const updates = {
                title: 'Updated Title',
                author: 'Updated Author',
                genre: 'Comedy',
                description: 'Updated description',
                year: 2024,
                cover: 'http://example.com/new-cover.jpg'
            };

            const response = await request(app)
                .put(`/books/${bookId}`)
                .send(updates)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Book updated successfully');

            // Verify update in database
            const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
            expect(rows[0].title).toBe('Updated Title');
            expect(rows[0].author).toBe('Updated Author');
            expect(rows[0].genre).toBe('Comedy');
        });

        it('should return 404 when updating non-existent book', async () => {
            const updates = {
                title: 'Non-existent Book',
                author: 'Ghost Author',
                genre: 'Mystery',
                description: null,
                year: null,
                cover: null
            };

            const response = await request(app)
                .put('/books/99999')
                .send(updates)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Book not found');
        });

        it('should update only provided fields', async () => {
            const [result] = await db.execute(
                'INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)',
                ['Original', 'Author', 'Fiction', 2020]
            );
            const bookId = result.insertId;

            const partialUpdate = {
                title: 'Partially Updated',
                author: 'Author', // keeping same
                genre: 'Fiction',
                description: null,
                year: 2020,
                cover: null
            };

            await request(app)
                .put(`/books/${bookId}`)
                .send(partialUpdate)
                .expect(200);

            const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
            expect(rows[0].title).toBe('Partially Updated');
            expect(rows[0].author).toBe('Author');
        });
  });

  describe('DELETE /books/:id - deleteBook', () => {
    
        it('should delete an existing book', async () => {
            // Create a book
            const [result] = await db.execute(
                'INSERT INTO books (title, author) VALUES (?, ?)',
                ['Book to Delete', 'Temporary Author']
            );
            const bookId = result.insertId;

            const response = await request(app)
                .delete(`/books/${bookId}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Book deleted successfully');

            // Verify deletion in database
            const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
            expect(rows).toHaveLength(0);
        });

        it('should return 404 when deleting non-existent book', async () => {
            const response = await request(app)
                .delete('/books/99999')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Book not found');
        });

        it('should not affect other books when deleting one', async () => {
            // Create multiple books
            const [result1] = await db.execute(
                'INSERT INTO books (title, author) VALUES (?, ?)',
                ['Book 1', 'Author 1']
            );
            const [result2] = await db.execute(
                'INSERT INTO books (title, author) VALUES (?, ?)',
                ['Book 2', 'Author 2']
            );
            const bookIdToDelete = result1.insertId;

            await request(app)
                .delete(`/books/${bookIdToDelete}`)
                .expect(200);

            // Verify only one book was deleted
            const [rows] = await db.query('SELECT * FROM books');
            expect(rows).toHaveLength(1);
            expect(rows[0].title).toBe('Book 2');
        });
    });
});