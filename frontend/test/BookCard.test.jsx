// This is a Unit Test file for testing the BookCard component

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookCard from '../src/components/BookCard.jsx';

// Mock fetch globally
global.fetch = vi.fn();

describe('BookCard Component', () => {

    const mockBook = {
        id: 1,
        title: 'Test Book Title',
        author: 'Test Author',
        genre: 'Fiction',
        year: 2025,
        cover: 'https://www.todayifoundout.com/wp-content/uploads/2017/11/rick-astley.png'
    };

    const mockOnDelete = vi.fn();

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
        // Reset fetch mock
        global.fetch.mockClear();
    });

    describe('Rendering', () => {
    
        it('should render book information correctly', () => {
            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            expect(screen.getByText('Test Book Title')).toBeInTheDocument();
            expect(screen.getByText('Test Author')).toBeInTheDocument();
            expect(screen.getByText('Genre: Fiction')).toBeInTheDocument();
            expect(screen.getByText('Year: 2025')).toBeInTheDocument();
        });

        it('should render book cover image when provided', () => {
            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const img = screen.getByAltText('Test Book Title');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'https://www.todayifoundout.com/wp-content/uploads/2017/11/rick-astley.png');
            expect(img).toHaveClass('book-cover');
        });

        it('should not render genre when not provided', () => {
            const bookWithoutGenre = { ...mockBook, genre: null };
            render(<BookCard book={bookWithoutGenre} onDelete={mockOnDelete} />);

            expect(screen.queryByText(/Genre:/)).not.toBeInTheDocument();
        });

        it('should not render year when not provided', () => {
            const bookWithoutYear = { ...mockBook, year: null };
            render(<BookCard book={bookWithoutYear} onDelete={mockOnDelete} />);

            expect(screen.queryByText(/Year:/)).not.toBeInTheDocument();
        });

        it('should not render cover image when not provided', () => {
            const bookWithoutCover = { ...mockBook, cover: null };
            render(<BookCard book={bookWithoutCover} onDelete={mockOnDelete} />);

            expect(screen.queryByAltText('Test Book Title')).not.toBeInTheDocument();
        });

        it('should render delete button', () => {
            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            expect(deleteButton).toBeInTheDocument();
            expect(deleteButton).toHaveClass('delete-book-button');
        });

        it('should have correct CSS classes', () => {
            const { container } = render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            expect(container.querySelector('.book-card')).toBeInTheDocument();
            expect(container.querySelector('.book-info')).toBeInTheDocument();
            expect(container.querySelector('.book-title')).toBeInTheDocument();
            expect(container.querySelector('.book-author')).toBeInTheDocument();
        });
    });

    describe('Delete Functionality', () => {

        it('should call delete API when delete button is clicked', async () => {
            // Mock successful delete response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Book deleted successfully' })
            });

            // Mock alert
            global.alert = vi.fn();

            // Mock import.meta.env
            vi.stubGlobal('import.meta', {
                env: {
                    VITE_API_URL: 'http://localhost:3000'
                }
            });

            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });

            // Check that fetch was called with the book ID
            const fetchCall = global.fetch.mock.calls[0];
            expect(fetchCall[0]).toContain('/books/1');
            expect(fetchCall[1]).toEqual(
                expect.objectContaining({
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                })
            );
        });

        it('should show success alert after successful deletion', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Book deleted successfully' })
            });

            global.alert = vi.fn();

            vi.stubGlobal('import.meta', {
                env: {
                    VITE_API_URL: 'http://localhost:3000'
                }
            });

            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith(
                    'Successfully deleted Test Book Title from your library!'
                );
            });
        });

        it('should call onDelete callback after successful deletion', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Book deleted successfully' })
            });

            global.alert = vi.fn();

            vi.stubGlobal('import.meta', {
                env: {
                    VITE_API_URL: 'http://localhost:3000'
                }
            });

            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockOnDelete).toHaveBeenCalledWith(1);
            });
        });

        it('should show error alert when deletion fails', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            global.alert = vi.fn();
            console.error = vi.fn(); // Suppress console.error in test

            vi.stubGlobal('import.meta', {
                env: {
                    VITE_API_URL: 'http://localhost:3000'
                }
            });

            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Failed to delete book.');
            });
        });

        it('should handle network errors gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            global.alert = vi.fn();
            console.error = vi.fn();

            vi.stubGlobal('import.meta', {
                env: {
                    VITE_API_URL: 'http://localhost:3000'
                }
            });

            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Failed to delete book.');
            });
        });

        it('should not call onDelete when deletion fails', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            global.alert = vi.fn();
            console.error = vi.fn();

            vi.stubGlobal('import.meta', {
                env: {
                    VITE_API_URL: 'http://localhost:3000'
                }
            });

            render(<BookCard book={mockBook} onDelete={mockOnDelete} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockOnDelete).not.toHaveBeenCalled();
            });
        });

        it('should work when onDelete callback is not provided', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Book deleted successfully' })
            });

            global.alert = vi.fn();

            vi.stubGlobal('import.meta', {
                env: {
                    VITE_API_URL: 'http://localhost:3000'
                }
            });

            // Render without onDelete prop
            render(<BookCard book={mockBook} />);

            const deleteButton = screen.getByRole('button', { name: /delete book/i });
            
            // Should not throw error
            expect(() => {
                fireEvent.click(deleteButton);
            }).not.toThrow();

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });
        });
    });

    describe('Edge Cases', () => {

        it('should handle missing book properties', () => {
            const incompleteBook = {
                id: 2,
                title: 'Incomplete Book'
            };

            render(<BookCard book={incompleteBook} onDelete={mockOnDelete} />);

            expect(screen.getByText('Incomplete Book')).toBeInTheDocument();
            // Should not crash when optional fields are missing
        });

        it('should handle very long book titles', () => {
            const longTitleBook = {
                ...mockBook,
                title: 'This is a very long book title that might cause layout issues if not handled properly in the component'
            };

            render(<BookCard book={longTitleBook} onDelete={mockOnDelete} />);

            expect(screen.getByText(/This is a very long book title/)).toBeInTheDocument();
        });

        it('should handle special characters in book data', () => {
            const specialCharsBook = {
                ...mockBook,
                title: 'Book & Title "with" Special \'Characters\'',
                author: 'Author <n>'
            };

            render(<BookCard book={specialCharsBook} onDelete={mockOnDelete} />);

            expect(screen.getByText(/Book & Title/)).toBeInTheDocument();
        });
    });
});