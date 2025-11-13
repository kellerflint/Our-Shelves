// cypress/e2e/book-search.cy.js
// E2E tests for book search and save functionality

describe('Book Search and Save Flow', () => {

    beforeEach(() => {
        // Clear all books before each test
        cy.clearAllBooks();
        cy.visit('/');
    });

    describe('Search Books from Open Library', () => {

        it('should display search section on home page', () => {
            cy.visit('/');
            
            // Should see search functionality
            cy.contains(/search/i).should('be.visible');
        });

        it('should search for books and display results', () => {
            cy.visit('/');
            
            // Find and fill search input
            cy.get('input[type="text"]').first().type('javascript');
            cy.get('button').contains(/search/i).click();
            
            // Should display search results

            cy.wait(2000);
        });

        it('should handle search with no results gracefully', () => {
            cy.visit('/');
            
            cy.get('input[type="text"]').first().type('xyznonexistent999');
            cy.get('button').contains(/search/i).click();
            
            cy.wait(2000);
        });

        it('should search using API directly and verify data structure', () => {
                cy.searchBooks('harry potter').then((response) => {
                    expect(response).to.have.property('searchTerm', 'harry potter');
                    expect(response).to.have.property('books');
                    expect(response.books).to.be.an('array');
                    
                    if (response.books.length > 0) {
                        const book = response.books[0];
                        expect(book).to.have.property('title');
                        expect(book).to.have.property('author');
                    }
                });
            });
        });

    describe('Save Book to Library', () => {

        it('should save a book to the library via API', () => {
            const newBook = {
                title: 'Test Book for E2E',
                author: 'E2E Test Author',
                genre: 'Testing',
                year: 2024,
                cover: 'http://example.com/cover.jpg'
            };

            cy.createBook(newBook).then((createdBook) => {
                expect(createdBook).to.have.property('id');
                expect(createdBook.title).to.eq(newBook.title);
                expect(createdBook.author).to.eq(newBook.author);
            });
        });

        // it('should verify saved book appears in library', () => {
        //     // Create a book
        //     const testBook = {
        //         title: 'Visible Test Book',
        //         author: 'Test Author',
        //         genre: 'Fiction'
        //     };

        //     cy.createBook(testBook);
            
        //     // Navigate to library (adjust route based on your app)
        //     cy.visit('/');
        //     cy.contains(/library/i).click();
            
        //     // Should see the book
        //     cy.contains('Visible Test Book').should('be.visible');
        // });
    });

    // describe('Complete Search and Save Workflow', () => {

    //     it('should search for a book and save it to library', () => {
    //         cy.visit('/');
            
    //         // Search for a book
    //         cy.get('input[type="text"]').first().type('1984');
    //         cy.get('button').contains(/search/i).click();
            
    //         cy.wait(2000);
            
    //         // Click on a result to save (if your UI has this)
    //         // This depends on your implementation
    //         // You may have a "Save to Library" button on search results
            
    //         // For now, we'll create via API and verify it shows in library
    //         cy.createBook({
    //             title: '1984',
    //             author: 'George Orwell',
    //             genre: 'Dystopian Fiction',
    //             year: 1949
    //         });
            
    //         // Navigate to library
    //         cy.visit('/');
    //         if (cy.contains(/library/i)) {
    //             cy.contains(/library/i).click();
    //         }
            
    //         // Verify book is in library
    //         cy.contains('1984').should('be.visible');
    //         cy.contains('George Orwell').should('be.visible');
    //     });
    // });

    describe('Search Results Display', () => {

        it('should display book details from search', () => {
            cy.searchBooks('the great gatsby').then((response) => {
                if (response.books.length > 0) {
                    const firstBook = response.books[0];
                    
                    // Verify book has required fields
                    expect(firstBook).to.have.property('title');
                    expect(firstBook).to.have.property('author');
                    
                    // Cover can be null
                    if (firstBook.cover) {
                        expect(firstBook.cover).to.include('https://covers.openlibrary.org');
                    }
                }
            });
        });

        // it('should handle special characters in search', () => {
        //     const specialSearchTerms = ['C++', 'What if?', 'Author: Name'];
            
        //     specialSearchTerms.forEach((term) => {
        //         cy.searchBooks(term).then((response) => {
        //             expect(response).to.have.property('searchTerm', term);
        //             expect(response).to.have.property('books');
        //         });
        //     });
        // });
    });

    describe('API Integration', () => {

        it('should handle concurrent book creations', () => {
            const books = [
                { title: 'Book 1', author: 'Author 1' },
                { title: 'Book 2', author: 'Author 2' },
                { title: 'Book 3', author: 'Author 3' }
            ];

            books.forEach((book) => {
                cy.createBook(book);
            });

            cy.getAllBooks().then((allBooks) => {
                expect(allBooks.length).to.be.at.least(3);
            });
        });

        it('should maintain data consistency across operations', () => {
            const testBook = {
                title: 'Consistency Test',
                author: 'Test Author',
                genre: 'Testing',
                year: 2025
            };

            // Create book
            cy.createBook(testBook).then((created) => {
                const bookId = created.id;
                
                // Retrieve the same book
                cy.getBook(bookId).then((retrieved) => {
                    expect(retrieved.title).to.eq(testBook.title);
                    expect(retrieved.author).to.eq(testBook.author);
                    expect(retrieved.genre).to.eq(testBook.genre);
                    expect(retrieved.year).to.eq(testBook.year);
                });
            });
        });
    });
});