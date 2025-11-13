import db from '../db.js';

/**
 * List all books
 * GET /books
 */
export const listBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        author,
        genre,
        description,
        year,
        cover,
        created_at AS createdAt
      FROM books
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('listBooks error:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

/**
 * Get single book
 * GET /books/:id
 */
export const getBookById = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        title,
        author,
        genre,
        description,
        year,
        cover,
        created_at AS createdAt
      FROM books
      WHERE id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('getBookById error:', err);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
};

/**
 * Create new book
 * POST /books
 */
export const createBook = async (req, res) => {
  const { title, author, genre, description, year, cover } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const [result] = await db.execute(`
      INSERT INTO books (title, author, genre, description, year, cover)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, author || null, genre || null, description || null, year || null, cover || null]);

    res.status(201).json({
      id: result.insertId,
      title,
      author,
      genre,
      description,
      year,
      cover
    });
  } catch (err) {
    console.error('createBook error:', err);
    res.status(500).json({ error: 'Failed to create book' });
  }
};

/**
 * Update book
 * PUT /books/:id
 */
export const updateBook = async (req, res) => {
  const { id } = req.params;
  const { title, author, genre, description, year, cover } = req.body;

  try {
    const [result] = await db.execute(`
      UPDATE books
      SET title = ?, author = ?, genre = ?, description = ?, year = ?, cover = ?
      WHERE id = ?
    `, [title, author, genre, description, year, cover, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book updated successfully' });
  } catch (err) {
    console.error('updateBook error:', err);
    res.status(500).json({ error: 'Failed to update book' });
  }
};

/**
 * Delete book
 * DELETE /books/:id
 */
export const deleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.execute('DELETE FROM books WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    console.error('deleteBook error:', err);
    res.status(500).json({ error: 'Failed to delete book' });
  }
};