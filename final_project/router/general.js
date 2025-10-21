const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Check if a user with the given username already exists
const doesExist = (username) => {
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
//PROMISE STUFF
// Get the book list available in the shop
public_users.get('/', (req, res) => {
    new Promise((resolve, reject) => {
      resolve(books);
    })
      .then((bookList) => {
        res.status(200).send(JSON.stringify(bookList, null, 4));
      })
      .catch((err) => {
        res.status(500).send("Error fetching book list: " + err.message);
      });
  });
  
  // Get book details based on ISBN
  public_users.get('/isbn/:isbn', (req, res) => {
    new Promise((resolve, reject) => {
      const isbn = req.params.isbn;
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found"));
      }
    })
      .then((book) => {
        res.status(200).send(book);
      })
      .catch((err) => {
        res.status(404).send(err.message);
      });
  });
  
  // Get book details based on author
  public_users.get('/author/:author', (req, res) => {
    new Promise((resolve, reject) => {
      const author = req.params.author.toLowerCase();
      const filteredBooks = Object.values(books).filter(
        (book) => book.author.toLowerCase() === author
      );
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error("Author not found"));
      }
    })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(404).send(err.message);
      });
  });
  
  // Get all books based on title
  public_users.get('/title/:title', (req, res) => {
    new Promise((resolve, reject) => {
      const title = req.params.title.toLowerCase();
      const filteredBooks = Object.values(books).filter(
        (book) => book.title.toLowerCase() === title
      );
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error("Title not found"));
      }
    })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((err) => {
        res.status(404).send(err.message);
      });
  });

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // key like 1 2 3 
    const book = books[isbn];
  
    if (book) {
      res.send(book.reviews);
    } else {
      res.status(404).send("Book not found");
    }
  });

module.exports.general = public_users;
