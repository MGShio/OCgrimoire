const express = require('express');
const cors = require("cors");
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

app.listen(PORT);

async function signup(req,res) {
    const body = req.body;
    console.log("body:", body);
    const email = req.body.email;
    const password = req.body.password;
    //Finding already existing users so we don't sign them up multiple times
    const userInDb = await User.findOne({
        email: email
    });
    console.log("userInDb:", userInDb);
    if (userInDb != null) {
        res.status(400).send("Email already exists");
        return;
    }
    //Creating a new user
    const user = {
        email: email,
        password: password,
    };
    // users.push(user);
    try {
        await User.create(user);
    } catch(error) {
        console.error(error);
        res.status(500).send("Something went wrong");
        return;
    }
    console.log("users:", users);
    res.send("sign up");
}

function login(req,res) {
    const body = req.body;
    console.log("body:", body);
    console.log("users in db:", users);

    const userInDb = users.find((user) => user.email === body.email);
    if (userInDb == null) {
        res.status(401).send("Wrong credentials");
        return;
    }

    const passwordInDb = userInDb.password;
    if (passwordInDb != body.password) {
        res.status(401).send("Wrong credentials");
        return;
    }

    if (body.email != "email") {
        res.status(401).send("Wrong credentials");
        return;
    }
    if (body.password != "password") {
        res.status(401).send("Wrong credentials");
        return;
    }
    res.send({
        userId: "123",
        token: "token"
    });
}