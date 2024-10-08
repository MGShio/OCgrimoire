require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

const DB_URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.DB_DOMAIN}`;

async function connect() {
  try {
    await mongoose.connect(DB_URL);
    console.log('Connected to DB');
  } catch (e) {
    console.error(e);
  }
}
connect();
