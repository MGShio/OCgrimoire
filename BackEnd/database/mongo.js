const mongoose = require('mongoose');
const PASSWORD = "123Toxo321";
const USER = "Shioiro";
const DB_URL = 'mongodb+srv://${USER}:${PASSWORD}@ocgrimoire.gslevfu.mongodb.net/?retryWrites=true&w=majority&appName=OCgrimoire'

async function connect() {
    try {
        await mongoose.connect(DB_URL);
    console.log("Connected to DB");
    }
    catch (error) {
        console.error(error);
    }
}
connect();

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", UserSchema);

module.exports = {User};


