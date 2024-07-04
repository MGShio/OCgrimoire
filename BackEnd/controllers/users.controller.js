// Import required modules
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");

// Create a new router instance
const usersRouter = express.Router();

// Define routes for signup and login
usersRouter.post("/signup", signUp);
usersRouter.post("/login", login);

// Function to handle signup requests
async function signUp(req, res) {
  // Extract email and password from request body
  const email = req.body.email;
  const password = req.body.password;

  // Check if email and password are provided
  if (email == null || password == null) {
    res.status(400).send("Email and password are required");
    return;
  }

  try {
    // Check if user already exists in the database
    const userInDb = await User.findOne({
      email: email
    });
    if (userInDb != null) {
      res.status(400).send("Email already exists");
      return;
    }

    // Create a new user object with hashed password
    const user = {
      email,
      password: hashPassword(password)
    };

    // Save the new user to the database
    await User.create(user);
    res.send("Sign up");
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong");
  }
}

// Function to handle login requests
async function login(req, res) {
  // Extract email and password from request body
  const body = req.body;
  if (body.email == null || body.password == null) {
    res.status(400).send("Email and password are required");
    return;
  }

  try {
    // Find the user in the database by email
    const userInDb = await User.findOne({
      email: body.email
    });

    // Check if user exists and password is correct
    if (userInDb == null) {
      res.status(401).send("Wrong credentials");
      return;
    }
    const passwordInDb = userInDb.password;
    if (!isPasswordCorrect(req.body.password, passwordInDb)) {
      res.status(401).send("Wrong credentials");
      return;
    }

    // Generate a JWT token and send it in the response
    res.send({
      userId: userInDb._id,
      token: generateToken(userInDb._id)
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong");
  }
}

// Function to generate a JWT token
function generateToken(idInDb) {
  const payload = {
    userId: idInDb
  };
  const jwtSecret = String(process.env.JWT_SECRET);
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "1d"
  });
  return token;
}

// Function to hash a password
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

// Function to check if a password is correct
function isPasswordCorrect(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// Export the router instance
module.exports = { usersRouter };
