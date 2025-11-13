// Custom Cypress commands for Our Shelves application

/**
 * Create a book via API
 * @example cy.createBook({ title: 'Test Book', author: 'Test Author' })
 */
Cypress.Commands.add('createBook', (bookData) => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/books`,
        body: bookData,
        headers: {
            'Content-Type': 'application/json'
        }    
    }).then((response) => {
        expect(response.status).to.eq(201);
        return response.body;
    });
});

/**
 * Get all books from API
 * @example cy.getAllBooks()
 */
Cypress.Commands.add('getAllBooks', () => {
    cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/books`
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});

/**
 * Get a single book by ID
 * @example cy.getBook(1)
 */
Cypress.Commands.add('getBook', (bookId) => {
    cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/books/id/${bookId}`
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});

/**
 * Delete a book via API
 * @example cy.deleteBook(1)
 */
Cypress.Commands.add('deleteBook', (bookId) => {
    cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/books/${bookId}`
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});

/**
 * Search books from Open Library API
 * @example cy.searchBooks('javascript')
 */
Cypress.Commands.add('searchBooks', (searchTerm) => {
    cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/books/search/${searchTerm}`
    }).then((response) => {
        expect(response.status).to.eq(200);
        return response.body;
    });
});

/**
 * Clear all books from database (for test cleanup)
 * @example cy.clearAllBooks()
 */
Cypress.Commands.add('clearAllBooks', () => {
    cy.getAllBooks().then((books) => {
        books.forEach((book) => {
            cy.deleteBook(book.id);
        });
    });
});

/**
 * Get element by className
 * @example cy.getByClass('book-card')
 */
Cypress.Commands.add('getByClass', (className) => {
    return cy.get(`.${className}`);
});

/**
 * Wait for API call to complete
 * @example cy.waitForAPI('@getBooksCall')
 */
Cypress.Commands.add('waitForAPI', (alias) => {
    cy.wait(alias).its('response.statusCode').should('be.oneOf', [200, 201]);
});