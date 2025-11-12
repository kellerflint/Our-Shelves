// This is an Integration Test file for testing the bookController.js file

import request from 'supertest';
import express from 'express';
import { fetchBooks } from '../controllers/bookController.js'

const app = express();
app.use(express.json());
app.get('books/search/:bookName', fetchBooks);

describe('Book Controller Integration Tests', () => {
    
    describe('GET /books/search/:bookName - fetchBooks', () => {
        
        it('should fetch books from Open Library API based on search term', async () => {
            const searchTerm = '';

            const response = await request(app)
                .get(`/books/search/${searchTerm}`)
                .expect('Content-type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('searchTerm', searchTerm);
            expect(response.body).toHaveProperty('totalResults');
            expect(response.body).toHaveProperty('books');
            expect(Array.isArray(response.body.books)).toBe(true);

            if (response.body.books.length > 0) {
                const firstBook = response.body.books[0];
                expect(firstBook).toHaveProperty('title');
                expect(firstBook).toHaveProperty('author');
                expect(firstBook).toHaveProperty('year');
                expect(firstBook).toHaveProperty('cover');
                expect(firstBook).toHaveProperty('pages');
            }
        }, 10000);

        
    });
});