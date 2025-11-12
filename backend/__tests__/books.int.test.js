import request from 'supertest';
import app from '../app.js';
import nock from 'nock';
import pool from '../db.js';

describe('Books CRUD (real MySQL)', () => {
  test('GET /books => [] on fresh DB', async () => {
    const res = await request(app).get('/books').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('POST /books then GET by id', async () => {
    const created = await request(app)
      .post('/books')
      .send({ title: 'Dune', author: 'Frank Herbert', year: 1965 })
      .expect(201);

    const id = created.body.id;
    const byId = await request(app).get(`/books/id/${id}`).expect(200);
    expect(byId.body.title).toBe('Dune');
  });

  test('POST /books without title => 400', async () => {
    await request(app).post('/books').send({ author: 'X' }).expect(400);
  });

  test('PUT then DELETE', async () => {
    const { body } = await request(app).post('/books').send({ title: 'Old' }).expect(201);

    await request(app)
      .put(`/books/${body.id}`)
      .send({ title: 'New', author: null, genre: null, description: null, year: null, cover: null })
      .expect(200);

    const afterUpdate = await request(app).get(`/books/id/${body.id}`).expect(200);
    expect(afterUpdate.body.title).toBe('New');

    await request(app).delete(`/books/${body.id}`).expect(200);
    await request(app).get(`/books/id/${body.id}`).expect(404);
  });
});

describe('Open Library search (stubbed)', () => {
  beforeEach(() => nock.cleanAll());

  test('GET /books/search/:q maps fields', async () => {
    nock('https://openlibrary.org')
      .get('/search.json')
      .query(true)
      .reply(200, {
        numFound: 1,
        docs: [
          {
            title: 'Dune',
            author_name: ['Frank Herbert'],
            first_publish_year: 1965,
            cover_i: 12345,
            number_of_pages_median: 412
          }
        ]
      });

    const res = await request(app).get('/books/search/Dune').expect(200);
    expect(res.body.searchTerm).toBe('Dune');
    expect(res.body.books[0]).toMatchObject({
      title: 'Dune',
      author: 'Frank Herbert',
      year: 1965,
      cover: expect.stringContaining('/b/id/12345-'),
      pages: 412
    });
  });
});

afterAll(async () => {
  nock.cleanAll();
  nock.restore();
  await pool.end();
});
