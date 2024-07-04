require("dotenv").config();
const mongoose = require('mongoose');
const DB_URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.DB_DOMAIN}/?retryWrites=true&w=majority&appName=OCgrimoire`;

async function connect() {
    try {
        await mongoose.connect(DB_URL)
    console.log("Connected to DB");
    }
    catch (error) {
        console.error("Error connecting to DB:", error);
    }
}
connect();

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", UserSchema);

const BookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: {
        type: [ratingSchema],
        default: [],
    },
    averageRating: { type: Number, default: 0 },
});

const Book = mongoose.model("Book", BookSchema);

module.exports = {User, Book};
