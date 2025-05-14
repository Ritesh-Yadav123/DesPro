const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./db");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
// Set the directory where the template files are located
app.set("views", path.join(__dirname, "views"));


// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up session middleware
app.use(
  session({
    secret: "your-secret-key", // Use a secure secret in production
    resave: false,
    saveUninitialized: true,
  })
);

const pathname = path.join(__dirname, "Public");
app.use(express.static(pathname));

app.get("/launch", (req, res) => {
  res.sendFile(`${pathname}/launch.html`);
});

app.get("/signUp", (req, res) => {
  res.sendFile(`${pathname}/signUp.html`);
});
const task = require("./task");
app.use("/task", task);
// app.use("/tasks", task);


app.get("*", (req, res) => {
  res.sendFile(`${pathname}/error.html`);
});

// Handle login form submissiond
app.post("/login", async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).send("Username and password are required!");
  }

  const query = "SELECT * FROM signUp WHERE user = ?";
  db.query(query, [user], async (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Server error");
    }

    if (results.length === 0) {
      return res.status(401).send("Invalid username or password");
    }

    const userRecord = results[0];
    try {
      const isMatch = await bcrypt.compare(password, userRecord.password);

      if (isMatch) {
        req.session.user = userRecord.user;
        req.session.name = userRecord.name;
        
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
      return res.status(500).send("Server error");
    }
    res.redirect("/task");  // Redirect to task page directly after saving session
  });
  
      } else {
        res.status(401).send("Invalid username or password");
      }
    } catch (err) {
      console.error("Error comparing passwords:", err);
      res.status(500).send("Server error");
    }
  });
});

app.post("/submit", (req, res) => {
  const { user, password, name, email, profession } = req.body;

  if (!user || !password || !name || !profession) {
    return res.status(400).send("All fields are required!");
  }

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).send("Error processing password");
    }

    const query = `
          INSERT INTO signUp (user, password, name, email, profession)
          VALUES (?, ?, ?, ?, ?)
      `;

    db.query(
      query,
      [user, hashedPassword, name, email, profession],
      (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).send("Username already exists");
          }
          return res.status(500).send("Error saving data");
        }
        res.send(
          'Form submitted successfully! <a href="/launch">Go to Login</a>'
        );
      }
    );
  });
});

// Sample protected dashboard route
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/launch");
  }
  res.send(
    `Welcome to the TMS Dashboard, ${req.session.name}! <a href="/logout">Logout</a>`
  );
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/launch");
  });
});


app.listen(3000);
