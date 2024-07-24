const mongoose = require('mongoose');

// Define the schema for the User model
const UserSchema = new mongoose.Schema({
  email: String,     // Email of the user
  password: String   // Password of the user (should be hashed and stored securely)
});

// Create a mongoose model for the User schema
const User = mongoose.model('User', UserSchema);

module.exports = { User }; // Export the User model
