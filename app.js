const express=require('express');
const path=require('path');
const bodyParser = require("body-parser");
const db = require('./db');
const bcrypt = require('bcrypt');
const session = require('express-session');


const app=express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session middleware
app.use(session({
    secret: 'your-secret-key',  // Use a secure secret in production
    resave: false,
    saveUninitialized: true
}));


const pathname=path.join(__dirname,'Public')
app.use(express.static(pathname));

app.get("/lauch",(req,res)=>{
    res.sendFile(`${pathname}/launch.html`)
})

app.get("/signUp",(req,res)=>{
    res.sendFile(`${pathname}/signUp.html`);
})


app.get("*",(req,res)=>{
    res.sendFile(`${pathname}/error.html`)
})



// Login Route (POST)
app.post("/login", (req, res) => {
    const { user, password } = req.body;
  
    if (!user || !password) {
      return res.status(400).send("Username and password are required!");
    }
  
    const query = `SELECT * FROM signUp WHERE user = ?`;
  
    db.query(query, [user], (err, result) => {
      if (err) {
        console.error("Error querying the database:", err);
        return res.status(500).send("Error checking credentials");
      }
  
      if (result.length === 0) {
        return res.status(401).send("Invalid username or password");
      }
  
      bcrypt.compare(password, result[0].password, (err, isMatch) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).send("Error comparing passwords");
        }
  
        if (!isMatch) {
          return res.status(401).send("Invalid username or password");
        }
  
        req.session.user = result[0];
        res.redirect('/dashboard');
      });
    });
  });
  

// Dashboard Route (Protected)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');  // Redirect to login page if not logged in
    }

    res.send(`Welcome, ${req.session.user.name}! <a href="/logout">Log out</a>`);
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error logging out");
        }
        res.redirect('/login');
    });
});

app.post("/submit", (req, res) => {
    const { user, password, name, email, profession } = req.body;
  
    // Log the data to ensure it's being received properly
    console.log(req.body);
  
    if (!user || !password || !name || !profession) {
      return res.status(400).send("All fields are required!");
    }
  
    const query = `
      INSERT INTO signUp (user, password, name, email, profession)
      VALUES (?, ?, ?, ?, ?)
    `;
  
    db.query(query, [user, password, name, email, profession], (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).send("Error saving data");
      }
      res.send('Form submitted successfully! <a href="/">Go to Home</a>');
    });
  });
  

app.listen(3000);