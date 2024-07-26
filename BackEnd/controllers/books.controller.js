const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { upload } = require('../middlewares/multer');
const { Book } = require('../models/Book');

const booksRouter = express.Router();
booksRouter.get('/bestrating', getBestRating);
booksRouter.get('/:id', getBookById);
booksRouter.get('/', getBooks);
booksRouter.post('/', checkToken, upload.single('image'), postBook);
booksRouter.delete('/:id', checkToken, deleteBook);
booksRouter.put('/:id', checkToken, upload.single('image'), putBook);
booksRouter.post('/:id/rating', checkToken, postRating);

async function postRating(req, res) {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: 'Book id is missing' });
  }

  const rating = req.body.rating;
  const userId = req.tokenPayload.userId;

  try {
    // Find the book by ID
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if the user has already rated the book
    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this book' });
    }

    // Add the new rating
    book.ratings.push({ userId, grade: rating });
    // Recalculate the average rating
    book.averageRating = calculateAverageRating(book.ratings);
    // Save the updated book
    await book.save();
    console.log('Updated book:', book);
    // Return the updated book object
    return res.status(200).json(book);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Something went wrong:' + e.message });
  }
}

function calculateAverageRating(ratings) {
  if (ratings.length === 0) return 0;
  const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return sumOfAllGrades / ratings.length;
}

async function getBestRating(req, res) {
  try {
    const booksWithBestRatings = await Book.find().sort({ rating: -1 }).limit(3);
    booksWithBestRatings.forEach((book) => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    });
    res.send(booksWithBestRatings);
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong:' + e.message);
  }
}

async function putBook(req, res) {
    const id = req.params.id;
    if (!req.body || !req.body.book) {
      res.status(400).send('Request body is missing or invalid');
      return;
    }
  const book = JSON.parse(req.body.book);
  try {
    const bookInDb = await Book.findById(id);
    if (bookInDb == null) {
      res.status(404).send('Book not found');
      return;
    }
    const userIdInDb = bookInDb.userId;
    const userIdInToken = req.tokenPayload.userId;
    if (userIdInDb !== userIdInToken) {
      res.status(403).send('You cannot modify other people\'s books');
      return;
    }

    const newBook = {};
    if (book.title) newBook.title = book.title;
    if (book.author) newBook.author = book.author;
    if (book.year) newBook.year = book.year;
    if (book.genre) newBook.genre = book.genre;
    if (req.file != null) newBook.imageUrl = req.file.filename;

    await Book.findByIdAndUpdate(id, newBook);
    res.send('Book updated');
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong:' + e.message);
  }
}

async function deleteBook(req, res) {
  const id = req.params.id;
  try {
    const bookInDb = await Book.findById(id);
    if (bookInDb == null) {
      res.status(404).send('Book not found');
      return;
    }
    const userIdInDb = bookInDb.userId;
    const userIdInToken = req.tokenPayload.userId;
    if (userIdInDb !== userIdInToken) {
      res.status(403).send('You cannot delete other people\'s books');
      return;
    }
    await Book.findByIdAndDelete(id);
    res.send('Book deleted');
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong:' + e.message);
  }
}

function checkToken(req, res, next) {
  const headers = req.headers;
  const authorization = headers.authorization;
  if (authorization == null) {
    res.status(401).send('Unauthorized');
    return;
  }
  const token = authorization.split(' ')[1];
  try {
    const jwtSecret = String(process.env.JWT_SECRET);
    const tokenPayload = jwt.verify(token, jwtSecret);
    if (tokenPayload == null) {
      res.status(401).send('Unauthorized');
      return;
    }
    req.tokenPayload = tokenPayload;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send('Unauthorized');
  }
}

async function getBookById(req, res) {
  const id = req.params.id;
  try {
    const book = await Book.findById(id);
    if (book == null) {
      res.status(404).send('Book not found');
      return;
    }
    book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    console.log('Fetched Book:', book);
    res.send(book);
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong:' + e.message);
  }
}

async function postBook(req, res) {
  const stringifiedBook = req.body.book;
  const book = JSON.parse(stringifiedBook);
  const filename = req.file.filename;
  book.imageUrl = filename;
  try {
    const result = await Book.create(book);
    res.send({ message: 'Book posted', book: result });
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong:' + e.message);
  }
}
async function getBooks(req, res) {
  try {
    const books = await Book.find();
    books.forEach((book) => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    });
    res.send(books);
  } catch (e) {
    console.error(e);
    res.status(500).send('Something went wrong:' + e.message);
  }
}

function getAbsoluteImagePath(fileName) {
  return process.env.PUBLIC_URL + '/' + process.env.IMAGES_PUBLIC_URL + '/' + fileName;
}

module.exports = { booksRouter };
