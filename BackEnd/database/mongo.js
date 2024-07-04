require("dotenv").config(); // Load environment variables from .env file
const mongoose = require('mongoose');

// Validate required environment variables
const requiredEnvVars = ['USER', 'PASSWORD', 'DB_DOMAIN'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`Environment variable ${envVar} is not defined.`);
    }
});

// MongoDB connection URL constructed using environment variables
const DB_URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.DB_DOMAIN}/?retryWrites=true&w=majority&appName=OCgrimoire`;

// Mongoose connection options to handle deprecations and improve stability
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
};

// Async function to connect to MongoDB
async function connect() {
    try {
        await mongoose.connect(DB_URL); // Attempt to connect to MongoDB using Mongoose
        console.log("Connected to DB"); // Log success message if connection is successful
    } catch (error) {
        console.error("Error connecting to DB:", error); // Log error message if connection fails
    }
}

connect(); // Call the connect function to initiate the connection to MongoDB
