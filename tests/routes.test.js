process.env.NODE_ENV = 'test';
const request = require('supertest');
const db = require('../db');
const app = require('../app');
const Book = require('../models/book');

let testBook;

beforeEach(async function () {
   await db.query('DELETE FROM books');

   testBook = await Book.create({
      isbn: '0001',
      amazon_url: 'http://a.co/eobPtX2',
      author: 'Testing Author',
      language: 'English',
      pages: 101,
      publisher: 'Test Publishing',
      title: 'Testing Title',
      year: 2024,
   });
});

afterAll(async function () {
   await db.end();
});

describe('01 GET /books', function () {
   test('01-01 get a list of all books', async function () {
      const response = await request(app).get('/books');

      expect(response.statusCode).toBe(200);
      expect(response.body.books).toHaveLength(1);
      expect(response.body.books[0]).toHaveProperty('isbn');
      expect(response.body).toEqual({ books: [testBook] });
   });
});

describe('02 GET /books/:id', function () {
   test('02-01 get a book based on id', async function () {
      const response = await request(app).get(`/books/${testBook.isbn}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.book).toHaveProperty('isbn');
      expect(response.body).toEqual({ book: testBook });
   });

   test('02-02 responds with 404 for invalid id', async () => {
      const response = await request(app).get(`/books/0`);
      expect(response.statusCode).toBe(404);
   });
});

describe('03 POST /books', function () {
   test('03-01 create a book', async function () {
      const response = await request(app)
         .post(`/books`)
         .send({
            book: {
               isbn: '0002',
               amazon_url: 'http://a.co/eobPtX2',
               author: 'Testing Author',
               language: 'English',
               pages: 101,
               publisher: 'Test Publishing',
               title: 'Testing Title',
               year: 2024,
            },
         });
      expect(response.statusCode).toBe(201);
      expect(response.body.book).toHaveProperty('isbn');
      expect(response.body.book).toHaveProperty('amazon_url');
   });

   test('03-02 responds with 404 for missing title', async () => {
      const response = await request(app).post(`/books`).send({ year: 1964 });
      expect(response.statusCode).toBe(400);
   });
});

describe('04 PUT /books/:id', function () {
   test('04-01 update a book based on id', async function () {
      const response = await request(app)
         .put(`/books/${testBook.isbn}`)
         .send({
            book: {
               isbn: '0001',
               amazon_url: 'http://a.co/eobPtX2',
               author: 'Testing Author',
               language: 'English',
               pages: 101,
               publisher: 'Test Publishing',
               title: 'Testing UPDATE',
               year: 2024,
            },
         });
      expect(response.statusCode).toBe(200);
      expect(response.body.book).toHaveProperty('isbn');
      expect(response.body.book.title).toBe('Testing UPDATE');
   });

   test('04-02 responds with 404 for invalid id', async () => {
      const response = await request(app).get(`/books/0`);
      expect(response.statusCode).toBe(404);
   });
});

describe('05 DELETE /books/:id', function () {
   test('05-01 deletes a book based on id', async function () {
      const id = testBook.isbn;
      const response = await request(app).delete(`/books/${id}`);
      expect(response.body).toEqual({ message: 'Book deleted' });
   });

   test('05-02 responds with 404 for invalid id', async function () {
      const response = await request(app).delete(`/books/05`);
      expect(response.statusCode).toBe(404);
   });
});
