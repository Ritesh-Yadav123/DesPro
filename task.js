const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("./db");

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/launch");
  }
}


// Route to render the 'task' EJS template
router.get("/", isAuthenticated, (req, res) => {
  res.render("task", { name: req.session.name });
  // Ensure 'task.ejs' exists in your 'views' directory
});

router.post("/", isAuthenticated, async (req, res) => {
  const { description } = req.body;
  const user = req.session.name;
  if (!user || !description) {
    return res.status(400).send("Missing user or description");
  }
  try {
    console.log("Submitting:", { user, description });
    const result = await db.query(
      "INSERT INTO tasks (user, description, title) VALUES (?, ?, NULL)",
      [user, description]
    );
    res.redirect("/task");
  } catch (err) {
    console.error("DB Error:", err.message, err.sql);
    res.status(500).send("Error adding task: " + err.message);
  }
});

module.exports = router;

