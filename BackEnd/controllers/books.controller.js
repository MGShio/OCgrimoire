const express = require('express');
const { upload } = require("../middlewares/multer"); // Import multer upload middleware
const { Book } = require("../models/Book"); // Import Book model
const jwt = require("jsonwebtoken"); // Import JSON Web Token library

const booksRouter = express.Router(); // Create an instance of Router for books

// Route to get top rated books
booksRouter.get("/bestrating", getBestRating);

// Route to get a specific book by ID
booksRouter.get("/:id", getBookById);

// Route to get all books
booksRouter.get("/", getBooks);

// Route to post a new book
booksRouter.post("/", checkToken, upload.single("image"), postBook);

// Route to delete a book by ID
booksRouter.delete("/:id", checkToken, deleteBook);

// Route to update a book by ID
booksRouter.put("/:id", checkToken, upload.single("image"), putBook);

// Route to post a rating for a book
booksRouter.post("/:id/rating", checkToken, postRating);

// Function to post a rating for a book
async function postRating(req, res) {
  const id = req.params.id;
  if (id == null || id == "undefined") {
    res.status(400).send("Book id is missing");
    return;
  }
  const rating = req.body.rating;
  const userId = req.tokenPayload.userId;
  try {
    const book = await Book.findById(id);
    if (book == null) {
      res.status(404).send("Book not found");
      return;
    }
    const ratingsInDb = book.ratings;
    const previousRatingFromCurrentUser = ratingsInDb.find((rating) => rating.userId == userId);
    if (previousRatingFromCurrentUser != null) {
      res.status(400).send("You have already rated this book");
      return;
    }
    const newRating = { userId, grade: rating };
    ratingsInDb.push(newRating);
    book.averageRating = calculateAverageRating(ratingsInDb);
    await book.save();
    res.send("Rating posted");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

// Function to calculate average rating from ratings array
function calculateAverageRating(ratings) {
  const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return sumOfAllGrades / ratings.length;
}

// Function to get books with highest ratings
async function getBestRating(req, res) {
  try {
    const booksWithBestRatings = await Book.find().sort({ rating: -1 }).limit(3);
    booksWithBestRatings.forEach((book) => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    });
    res.send(booksWithBestRatings);
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

// Function to update a book by ID
async function putBook(req, res) {
  const id = req.params.id;
  const book = JSON.parse(req.body.book);
  try {
    const bookInDb = await Book.findById(id);
    if (bookInDb == null) {
      res.status(404).send("Book not found");
      return;
    }
    const userIdInDb = bookInDb.userId;
    const userIdInToken = req.tokenPayload.userId;
    if (userIdInDb != userIdInToken) {
      res.status(403).send("You cannot modify other people's books");
      return;
    }

    const newBook = {};
    if (book.title) newBook.title = book.title;
    if (book.author) newBook.author = book.author;
    if (book.year) newBook.year = book.year;
    if (book.genre) newBook.genre = book.genre;
    if (req.file != null) newBook.imageUrl = req.file.filename;

    await Book.findByIdAndUpdate(id, newBook);
    res.send("Book updated");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

// Function to delete a book by ID
async function deleteBook(req, res) {
  const id = req.params.id;
  try {
    const bookInDb = await Book.findById(id);
    if (bookInDb == null) {
      res.status(404).send("Book not found");
      return;
    }
    const userIdInDb = bookInDb.userId;
    const userIdInToken = req.tokenPayload.userId;
    if (userIdInDb != userIdInToken) {
      res.status(403).send("You cannot delete other people's books");
      return;
    }
    await Book.findByIdAndDelete(id);
    res.send("Book deleted");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

// Middleware to check validity of JSON Web Token
function checkToken(req, res, next) {
  const headers = req.headers;
  const authorization = headers.authorization;
  if (authorization == null) {
    res.status(401).send("Unauthorized");
    return;
  }
  const token = authorization.split(" ")[1];
  try {
    const jwtSecret = String(process.env.JWT_SECRET);
    const tokenPayload = jwt.verify(token, jwtSecret);
    if (tokenPayload == null) {
      res.status(401).send("Unauthorized");
      return;
    }
    req.tokenPayload = tokenPayload;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send("Unauthorized");
  }
}

// Function to get a book by ID
async function getBookById(req, res) {
  const id = req.params.id;
  try {
    const book = await Book.findById(id);
    if (book == null) {
      res.status(404).send("Book not found");
      return;
    }
    book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    res.send(book);
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

// Function to post a new book
async function postBook(req, res) {
  const stringifiedBook = req.body.book;
  const book = JSON.parse(stringifiedBook);
  const filename = req.file.filename;
  book.imageUrl = filename;
  try {
    const result = await Book.create(book);
    res.send({ message: "Book posted", book: result });
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

// Function to get all books
async function getBooks(req, res) {
  try {
    const books = await Book.find();
    books.forEach((book) => {
      book.imageUrl = getAbsoluteImagePath(book.imageUrl);
    });
    res.send(books);
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong:" + e.message);
  }
}

// Function to get absolute image path
function getAbsoluteImagePath(fileName) {
  return process.env.PUBLIC_URL + "/" + process.env.IMAGES_PUBLIC_URL + "/" + fileName;
}

module.exports = { booksRouter };
