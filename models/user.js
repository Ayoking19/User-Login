// 1. Import Mongoose into this file
const mongoose = require('mongoose');

// 2. Define the exact structure of a User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, 
        unique: true 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// 3. Compile the Schema into an active Model and export it
const User = mongoose.model('User', userSchema);
module.exports = User; // [Allows other files, like server.js, to import and use this Model]