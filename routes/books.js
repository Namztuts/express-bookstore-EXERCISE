const express = require('express');
const Book = require('../models/book');
const ExpressError = require('../expressError');

const jsonschema = require('jsonschema');
const bookSchema = require('../schemas/bookSchema.json'); //requiring our schema

const router = new express.Router();

/** GET / => {books: [book, ...]}  */
router.get('/', async function (req, res, next) {
   try {
      const books = await Book.findAll(req.query);
      return res.json({ books });
   } catch (err) {
      return next(err);
   }
});

/** GET /[id]  => {book: book} */
router.get('/:id', async function (req, res, next) {
   try {
      const book = await Book.findOne(req.params.id);
      return res.json({ book });
   } catch (err) {
      return next(err);
   }
});

/** POST /   bookData => {book: newBook}  */
router.post('/', async function (request, response, next) {
   try {
      const result = jsonschema.validate(request.body, bookSchema); // validate request.body against our book schema
      if (!result.valid) {
         // if the result is not valid (based on our schema)
         const listOfErrors = result.errors.map((e) => e.stack); // looping over the errors and grabbing the error.stack | provides more details about the schema error
         const error = new ExpressError(listOfErrors, 400);

         return next(error); // call next with error
      }
      // NOTE: if we get here, then the user input matches the schema
      const book = await Book.create(request.body.book);
      return response.status(201).json({ book });
   } catch (error) {
      return next(error);
   }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */
router.put('/:isbn', async function (request, response, next) {
   try {
      const result = jsonschema.validate(request.body, bookSchema); // validate request.body against our book schema
      if (!result.valid) {
         // if the result is not valid (based on our schema)
         const listOfErrors = result.errors.map((e) => e.stack); // looping over the errors and grabbing the error.stack | provides more details about the schema error
         const error = new ExpressError(listOfErrors, 400);

         return next(error);
      }
      const book = await Book.update(request.params.isbn, request.body.book);
      return response.json({ book });
   } catch (err) {
      return next(err);
   }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */
router.delete('/:isbn', async function (req, res, next) {
   try {
      await Book.remove(req.params.isbn);
      return res.json({ message: 'Book deleted' });
   } catch (err) {
      return next(err);
   }
});

module.exports = router;
