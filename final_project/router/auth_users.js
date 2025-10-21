const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const users = [];

const isValid = (username)=>{ 
        // Filter the users array for any user with the same username
        let userswithsamename = users.filter((user) => {
            return user.username === username;
        });
        // Return true if any user with the same username is found, otherwise false
        if (userswithsamename.length > 0) {
            return true;
        } else {
            return false;
        }
    }

const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Auth
  const auth = req.session?.authorization;
  if (!auth || !auth.username) {
    return res.status(401).json({ message: "Not logged in" });
  }
  const username = auth.username;

  // Get needed info
  const { isbn } = req.params;
  const review = (req.query.review || "").trim();
  if (!review) {
    return res.status(400).json({ message: 'Query parameter "review" is required' });
  }

  // Finding a book
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // So it wont die if undefined
  if (!book.reviews || typeof book.reviews !== 'object') {
    book.reviews = {};
  }

  // pushing it
  const isUpdate = Boolean(book.reviews[username]);
  book.reviews[username] = review;

  return res.status(200).json({
    message: isUpdate ? "Review updated" : "Review added",
    isbn,
    username,
    reviews: book.reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Auth
    const auth = req.session?.authorization;
    if (!auth || !auth.username) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const username = auth.username;
  
    // Getting book
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Checking for reviews
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "No review by this user" });
    }
  
    // Work work work 
    delete book.reviews[username];
  
    // Thank you it is deleted
    return res.status(200).json({
      message: "Your review was deleted successfully",
      isbn,
      reviews: book.reviews
    });
  });
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
