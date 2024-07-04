const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { User, Book } = require('./database/mongo.js');
const { uploadImage, compressImage } = require('./database/imageMiddleware.js');

const app = express();
const PORT = 4000;

// Middleware setup
// CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

// Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/books', getBooks);
app.post('/api/books', uploadImage, compressImage, postBook); // Use uploadImage and compressImage middleware

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Signup function
async function signup(req, res) {
  const { email, password } = req.body;
  try {
    const userInDb = await User.findOne({ email });
    if (userInDb) {
      return res.status(400).send('Email already exists');
    }

    const hashedPassword = hashPassword(password);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.send('Signup successful');
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Something went wrong');
  }
}

// Login function
async function login(req, res) {
  const { email, password } = req.body;
  try {
    const userInDb = await User.findOne({ email });
    if (!userInDb) {
      return res.status(401).send('Wrong credentials');
    }

    const isPasswordValid = isPasswordCorrect(password, userInDb.password);
    if (!isPasswordValid) {
      return res.status(401).send('Wrong credentials');
    }

    // If you reach here, credentials are correct
    res.send({
      userId: userInDb._id,
      token: 'generated_token_here', // Generate a real token for authentication
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Something went wrong');
  }
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

function isPasswordCorrect(password, hash) {
  return bcrypt.compareSync(password, hash);
}

async function getBooks(req, res) {
  try {
    const books = await Book.find();
    res.send(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).send('Something went wrong');
  }
}

async function postBook(req, res) {
    try {
      const bookString = req.body.book;
      const bookData = JSON.parse(bookString);
  
      // Add the image file path to the book data if image was uploaded
      if (req.file) {
        bookData.image = req.file.path;
        console.log('Uploaded file path:', req.file.path); // Log file path
      }
  
      // Create the new book entry
      await Book.create(bookData);
  
      res.status(201).send('Book created successfully');
    } catch (error) {
      console.error('Error posting book:', error);
      res.status(500).send('Something went wrong');
    }
  }