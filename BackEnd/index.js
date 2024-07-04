// Load environment variables from .env file
require("dotenv").config();

// Import necessary modules and routers
const { app } = require("./config/app");  // Import the Express app instance from ./config/app.js
const { usersRouter } = require("./controllers/users.controller");  // Import the users router from ./controllers/users.controller.js
const { booksRouter } = require("./controllers/books.controller");  // Import the books router from ./controllers/books.controller.js
const { connectToDB } = require("./database/mongo"); // Import the function to connect to MongoDB


// Set the port for the server to run on, defaulting to 4000 or value from environment variable
const PORT = process.env.PORT || 4000;

// Define a basic route to check if server is running
app.get("/", (req, res) => res.send("Server running!"));

// Define routes for user authentication under /api/auth
app.use("/api/auth", usersRouter);

// Define routes for books management under /api/books
app.use("/api/books", booksRouter);

// Start the server and listen on specified port
app.listen(PORT, () => console.log(`Server is running on: ${PORT}`));
