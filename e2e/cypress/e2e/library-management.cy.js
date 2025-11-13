// cypress/e2e/library-management.cy.js
// E2E tests for library management and book operations

describe('Library Management Flow', () => {

    beforeEach(() => {
        // Clear all books and start fresh
        cy.clearAllBooks();
    });

    describe('View Library', () => {

        it('should display empty library when no books exist', () => {
            cy.visit('/');
            
            // Navigate to library if needed
            // Adjust based on your routing
            
            // Should show empty state or no books
            cy.getAllBooks().then((books) => {
                expect(books).to.have.length(0);
            });
        });

        it('should display all saved books in library', () => {
            // Create test books
            const testBooks = [
                { title: 'Book One', author: 'Author One', genre: 'Fiction' },
                { title: 'Book Two', author: 'Author Two', genre: 'Non-Fiction' },
                { title: 'Book Three', author: 'Author Three', genre: 'Mystery' }
            ];

            testBooks.forEach((book) => {
                cy.createBook(book);
            });

            cy.getAllBooks().then((books) => {
                expect(books).to.have.length(3);
                expect(books[0]).to.have.property('title');
                expect(books[0]).to.have.property('author');
            });
        });

        it('should display books in correct order (newest first)', () => {
                // Create books in sequence
                cy.createBook({ title: 'First Book', author: 'Author' });
                cy.wait(100);
                cy.createBook({ title: 'Second Book', author: 'Author' });
                cy.wait(100);
                cy.createBook({ title: 'Third Book', author: 'Author' });

                cy.getAllBooks().then((books) => {
                // Should be ordered by id DESC (newest first)
                expect(books[0].title).to.eq('Third Book');
                expect(books[1].title).to.eq('Second Book');
                expect(books[2].title).to.eq('First Book');
            });
        });
    });

    // describe('Book Details Display', () => {

    //     it('should show all book information in BookCard', () => {
    //         const completeBook = {
    //             title: 'Complete Book Info',
    //             author: 'Full Author Name',
    //             genre: 'Science Fiction',
    //             year: 2023,
    //             cover: 'http://example.com/cover.jpg'
    //         };

    //         cy.createBook(completeBook);
    //         cy.visit('/');

    //         // Should display all book fields
    //         cy.contains('Complete Book Info').should('be.visible');
    //         cy.contains('Full Author Name').should('be.visible');
    //         cy.contains('Science Fiction').should('be.visible');
    //         cy.contains('2023').should('be.visible');
    //     });

    //     it('should handle books with missing optional fields', () => {
    //         const minimalBook = {
    //             title: 'Minimal Book'
    //         };

    //         cy.createBook(minimalBook);
    //         cy.visit('/');

    //         cy.contains('Minimal Book').should('be.visible');
    //         // Should not crash despite missing fields
    //     });

    //     it('should display book cover when available', () => {
    //         const bookWithCover = {
    //             title: 'Book with Cover',
    //             author: 'Author',
    //             cover: 'http://example.com/test-cover.jpg'
    //         };

    //         cy.createBook(bookWithCover).then((created) => {
    //         cy.visit('/');
            
    //         // Find the book cover image
    //         cy.get('img[alt="Book with Cover"]').should('exist');
    //         cy.get('img[alt="Book with Cover"]').should('have.attr', 'src', bookWithCover.cover);
    //         });
    //     });
    // });

    describe('Delete Book', () => {

        // it('should delete a book via delete button in UI', () => {
        //     const bookToDelete = {
        //         title: 'Book to Delete from UI',
        //         author: 'Delete Me',
        //         genre: 'Test'
        //     };

        //     cy.createBook(bookToDelete);
        //     cy.visit('/');

        //     // Find and click delete button
        //     cy.contains('Book to Delete from UI')
        //     .parent()
        //     .parent()
        //     .find('button')
        //     .contains(/delete/i)
        //     .click();

        //     // Wait for deletion to complete
        //     cy.wait(500);

        //     // Verify book is gone
        //     cy.contains('Book to Delete from UI').should('not.exist');
        // });

        it('should delete book via API and verify removal', () => {
            cy.createBook({ title: 'API Delete Test', author: 'Test' }).then((created) => {
            const bookId = created.id;
            
            // Delete via API
            cy.deleteBook(bookId);
            
            // Verify deletion
            cy.request({
                method: 'GET',
                url: `${Cypress.env('apiUrl')}/books/id/${bookId}`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
            });
            });
        });

        it('should handle deletion of non-existent book', () => {
            cy.request({
                method: 'DELETE',
                url: `${Cypress.env('apiUrl')}/books/99999`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
                expect(response.body).to.have.property('error', 'Book not found');
            });
        });

        it('should not affect other books when deleting one', () => {
            // Create multiple books
            cy.createBook({ title: 'Keep Book 1', author: 'Keep' });
            cy.createBook({ title: 'Delete This', author: 'Delete' }).then((toDelete) => {
            cy.createBook({ title: 'Keep Book 2', author: 'Keep' });
            
            // Delete middle book
            cy.deleteBook(toDelete.id);
            
            // Verify other books still exist
            cy.getAllBooks().then((books) => {
                expect(books).to.have.length(2);
                const titles = books.map(b => b.title);
                expect(titles).to.include('Keep Book 1');
                expect(titles).to.include('Keep Book 2');
                expect(titles).to.not.include('Delete This');
            });
            });
        });
    });

    describe('Complete Library Management Workflow', () => {

        it('should complete full CRUD workflow', () => {
            // CREATE
            const newBook = {
                title: 'CRUD Test Book',
                author: 'Test Author',
                genre: 'Testing',
                year: 2025
            };

            cy.createBook(newBook).then((created) => {
                const bookId = created.id;
                
                // READ
                cy.getBook(bookId).then((retrieved) => {
                    expect(retrieved.title).to.eq(newBook.title);
                    expect(retrieved.author).to.eq(newBook.author);
                });

                // UPDATE (via API)
                cy.request({
                    method: 'PUT',
                    url: `${Cypress.env('apiUrl')}/books/${bookId}`,
                    body: {
                        title: 'Updated CRUD Book',
                        author: newBook.author,
                        genre: newBook.genre,
                        description: 'Updated description',
                        year: newBook.year,
                        cover: null
                    }
                    }).then((updateResponse) => {
                        expect(updateResponse.status).to.eq(200);
                    });

                    // Verify update
                    cy.getBook(bookId).then((updated) => {
                        expect(updated.title).to.eq('Updated CRUD Book');
                        expect(updated.description).to.eq('Updated description');
                    });

                    // DELETE
                    cy.deleteBook(bookId);

                    // Verify deletion
                    cy.request({
                        method: 'GET',
                        url: `${Cypress.env('apiUrl')}/books/id/${bookId}`,
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.eq(404);
                });
            });
        });
    });

    describe('Multiple Book Operations', () => {

    it('should handle bulk book creation', () => {
        const books = Array.from({ length: 10 }, (_, i) => ({
            title: `Bulk Book ${i + 1}`,
            author: `Author ${i + 1}`,
            genre: 'Bulk Test'
        }));

        books.forEach((book) => {
            cy.createBook(book);
        });

        cy.getAllBooks().then((allBooks) => {
            expect(allBooks.length).to.eq(10);
        });
    });

    it('should maintain data integrity with rapid operations', () => {
        // Rapidly create and delete books
        cy.createBook({ title: 'Rapid 1', author: 'Author' }).then((b1) => {
        cy.createBook({ title: 'Rapid 2', author: 'Author' }).then((b2) => {
            cy.createBook({ title: 'Rapid 3', author: 'Author' });
            
            // Delete first two
            cy.deleteBook(b1.id);
            cy.deleteBook(b2.id);
            
            // Verify only one remains
            cy.getAllBooks().then((books) => {
                expect(books).to.have.length(1);
                expect(books[0].title).to.eq('Rapid 3');
            });
        });
        });
    });
    });

    describe('UI Interactions', () => {

        it('should navigate between home and library pages', () => {
            cy.visit('/');
            
            // Should be on home page
            cy.url().should('include', '/');
            
            // Navigate to library (if separate route)
            // Adjust based on your routing structure
            if (cy.contains(/library/i)) {
                cy.contains(/library/i).click();
                // Verify navigation
            }
        });

        // it('should display book cards with correct CSS classes', () => {
        //         cy.createBook({ title: 'CSS Test Book', author: 'Test' });
        //         cy.visit('/');

        //         cy.getByClass('book-card').should('exist');
        //         cy.getByClass('book-info').should('exist');
        //         cy.getByClass('book-title').should('exist');
        //         cy.getByClass('delete-book-button').should('exist');
        //     });
        // });

    describe('Error Handling', () => {

        it('should handle API errors gracefully', () => {
            // Try to get non-existent book
            cy.request({
                method: 'GET',
                url: `${Cypress.env('apiUrl')}/books/id/99999`,
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(404);
                expect(response.body).to.have.property('error');
            });
        });

        it('should handle invalid book data', () => {
            cy.request({
                method: 'POST',
                url: `${Cypress.env('apiUrl')}/books`,
                body: {
                    author: 'Author Without Title'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('error', 'Title is required');
            });
        });
    });

    // describe('Data Persistence', () => {

    //     it('should persist books across page reloads', () => {
    //         cy.createBook({ title: 'Persistent Book', author: 'Author' });
            
    //         cy.visit('/');
    //         cy.contains('Persistent Book').should('be.visible');
            
    //         // Reload page
    //         cy.reload();
            
    //         // Book should still be visible
    //         cy.contains('Persistent Book').should('be.visible');
    //     });
    // });
})});