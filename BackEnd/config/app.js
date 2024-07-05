const express = require("express");
const cors = require("cors");
const app = express();
const path = require('path');
require('dotenv').config(); // Load .env file

app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
const imagesFolder = process.env.IMAGES_FOLDER;
app.use("/" + process.env.IMAGES_PUBLIC_URL, express.static(path.join(__dirname, imagesFolder)));

module.exports = { app };
