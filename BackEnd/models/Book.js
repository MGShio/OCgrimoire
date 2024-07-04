const mongoose = require("mongoose");

// Define the schema for the Book model
const BookSchema = new mongoose.Schema({
  userId: String,          // User ID of the book owner
  title: String,           // Title of the book
  author: String,          // Author of the book
  year: Number,            // Year of publication
  genre: String,           // Genre of the book
  imageUrl: String,        // URL/path to the book's image
  ratings: [{              // Array of ratings given by users
    userId: String,        // User ID of the rater
    grade: Number          // Numeric rating given by the user
  }],
  averageRating: Number    // Average rating computed based on all ratings
});

// Create a mongoose model for the Book schema
const Book = mongoose.model("Book", BookSchema);

module.exports = { Book }; // Export the Book model
