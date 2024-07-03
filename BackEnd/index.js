const express = require('express');
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const {User} = require("./database/mongo.js");
const PORT = 4000;

//Cors security coming from the browser itself
app.use(cors())
app.use(express.json())

function sayHi(req, res) {
    res.send('Hello World')
  }

app.get('/', sayHi);
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.get("/api/books", getBooks);

app.listen(PORT);

async function signup(req, res) {
    const { email, password } = req.body;

    // Finding already existing users so we don't sign them up multiple times
    const userInDb = await User.findOne({ email });

    if (userInDb) {
        return res.status(400).send("Email already exists");
    }

    // Hash the password before saving it
    const hashedPassword = hashPassword(password);

    // Create a new user object with hashed password
    const newUser = new User({
        email: email,
        password: hashedPassword,
    });

    try {
        await newUser.save();
        res.send("sign up successful");
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        const userInDb = await User.findOne({ email });

        if (!userInDb) {
            return res.status(401).send("Wrong credentials");
        }

        const isPasswordValid = isPasswordCorrect(password, userInDb.password);

        if (!isPasswordValid) {
            return res.status(401).send("Wrong credentials");
        }

        // If you reach here, credentials are correct
        res.send({
            userId: userInDb._id,
            token: "generated_token_here" // Generate a real token for authentication
        });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send("Something went wrong");
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

