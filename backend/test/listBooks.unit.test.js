// backend/test/data.unit.test.js
// Unit Test file for testing data validation and utility functions

describe('Data Unit Tests', () => {

    describe('Book Data Validation', () => {

        it('should validate that title is required', () => {
            const validBook = { title: 'Test Book' };
            const invalidBook = { author: 'Test Author' };

            expect(validBook.title).toBeDefined();
            expect(validBook.title.length).toBeGreaterThan(0);
            expect(invalidBook.title).toBeUndefined();
        });

        it('should accept valid book data structure', () => {
            const bookData = {
                title: 'Valid Book',
                author: 'John Doe',
                genre: 'Fiction',
                description: 'A great book',
                year: 2023,
                cover: 'http://example.com/cover.jpg'
            };

            expect(bookData.title).toBe('Valid Book');
            expect(typeof bookData.title).toBe('string');
            expect(typeof bookData.author).toBe('string');
            expect(typeof bookData.year).toBe('number');
        });

        it('should validate year as number', () => {
            const validYear = 2023;
            const invalidYear = 'twenty twenty three';

            expect(typeof validYear).toBe('number');
            expect(validYear).toBeGreaterThan(0);
            expect(validYear).toBeLessThan(3000);
            expect(typeof invalidYear).not.toBe('number');
        });
    });

    describe('Open Library API Response Mapping', () => {

        it('should map book with all fields', () => {
            const openLibraryBook = {
                title: 'Test Book',
                author_name: ['John Doe', 'Jane Smith'],
                first_publish_year: 2020,
                cover_i: 12345,
                number_of_pages_median: 250
            };

            const mapped = {
                title: openLibraryBook.title,
                author: Array.isArray(openLibraryBook.author_name) 
                    ? openLibraryBook.author_name[0] 
                    : 'Unknown',
                year: openLibraryBook.first_publish_year || null,
                cover: openLibraryBook.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${openLibraryBook.cover_i}-M.jpg` 
                    : null,
                pages: openLibraryBook.number_of_pages_median || null
            };

            expect(mapped.title).toBe('Test Book');
            expect(mapped.author).toBe('John Doe');
            expect(mapped.year).toBe(2020);
            expect(mapped.cover).toMatch(/covers\.openlibrary\.org/);
            expect(mapped.pages).toBe(250);
        });

        it('should handle missing author as "Unknown"', () => {
                const bookWithoutAuthor = {
                    title: 'Anonymous Book',
                    author_name: undefined
                };

                const mapped = {
                title: bookWithoutAuthor.title,
                author: Array.isArray(bookWithoutAuthor.author_name)
                    ? bookWithoutAuthor.author_name[0]
                    : 'Unknown'
                };

                expect(mapped.author).toBe('Unknown');
            });
        });

        describe('URL Encoding', () => {

        it('should properly encode search terms for URLs', () => {
            const searchTerms = [
                'harry potter',
                'the great gatsby',
                'to kill a mockingbird'
            ];

            searchTerms.forEach(term => {
            const encoded = encodeURIComponent(term);
            expect(encoded).not.toContain(' ');
            expect(decodeURIComponent(encoded)).toBe(term);
            });
        });

        it('should handle special characters in URLs', () => {
                const specialTerms = [
                    'SDEV 372',
                    'What if?',
                    'Author: Ray'
                ];

                specialTerms.forEach(term => {
                const encoded = encodeURIComponent(term);
                expect(encoded).toBeDefined();
                expect(encoded.length).toBeGreaterThan(0);
            });
        });
    });
});


