// 1. Import the Express library and the Path module
const express = require('express');
const path = require('path'); // [A built-in Node.js module used for safely combining folder and file names]
const mongoose = require('mongoose'); // [Imports the Mongoose database translator]
require('dotenv').config(); // [Unlocks the .env file so our server can read the hidden secrets inside]

// NEW: Import our User Model blueprint
const User = require('./models/User');

// 2. Initialize the Express application
const app = express();

// --- DATABASE CONNECTION ---
// mongoose.connect() is the command that reaches out across the internet to log into your database
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // A Promise [A proxy for a value not necessarily known when the promise is created] that runs if the connection succeeds
        console.log("SUCCESS! The server is officially connected to MongoDB Atlas.");
    })
    .catch((error) => {
        // Catches and prints any errors if the database connection fails
        console.log("CRITICAL ERROR: Database connection failed!");
        console.log(error);
    });
// ---------------------------

// --- MIDDLEWARE CODE ---
// express.static() is a built-in middleware function that automatically serves any file placed inside the specified folder
app.use(express.static(path.join(__dirname, 'public')));

// The Body Parser: This tells Express how to read data sent from an HTML form
app.use(express.urlencoded({ extended: true })); 
// ------------------

// --- GET ROUTES (Loading the Pages) ---
// The '/' represents the Root URL [The absolute base address of your website, essentially the homepage]
app.get('/', (req, res) => {
    // res.sendFile() is a command that tells the server to send an entire file back to the user's browser
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Route 2: The Sign Up Page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Route 3: The Welcome Page
app.get('/welcome', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'welcome.html'));
});

// --- UPGRADED POST ROUTES (Receiving the Data) ---

// Route to handle the Sign Up form submission
app.post('/signup', async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        await newUser.save();
        
        // On success, redirect them to the login page with a success message in the URL
        res.redirect('/?message=registered');

    } catch (error) {
        // If the database rejects it (e.g., email already taken), redirect back to signup with an error
        res.redirect('/signup?error=exists');
    }
});

// Route to handle the Login form submission
app.post('/login', async (req, res) => {
    try {
        console.log("Attempting to log a user in...");

        // 1. Database Query: Search the database for a document where the username matches
        const foundUser = await User.findOne({ username: req.body.username });

        // 2. Condition A: The user does not exist
        if (!foundUser) {
            console.log("Login Failed: Username not found.");
            // We politely redirect them with the secret URL message instead of raw text
            return res.redirect('/?error=notfound');
        }

        // 3. Condition B: The user exists, but the password is wrong
        if (foundUser.password !== req.body.password) {
            console.log("Login Failed: Incorrect password.");
            return res.redirect('/?error=wrongpassword');
        }

        // 4. Condition C: Everything is perfectly correct!
        console.log("SUCCESS: Credentials match! Redirecting to Welcome Page...");
        res.redirect('/welcome');

    } catch (error) {
        console.log("CRITICAL ERROR during login.");
        console.log(error);
        res.redirect('/?error=servererror');
    }
});

// 4. Define a Port number
// This tells Express: "Use the Cloud Provider's designated port IF it exists, OTHERWISE use 3000"
const PORT = process.env.PORT || 3000;

// 5. Tell the server to listen for traffic on that Port
app.listen(PORT, () => {
    console.log(`Success! The server is currently running on http://localhost:${PORT}`);
});