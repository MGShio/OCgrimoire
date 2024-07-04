const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use("/images", express.static(__dirname + "/../public/images"));

module.exports = { app };