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

  try {
    const [result] = await db.execute(
      "INSERT INTO tasks (user, description) VALUES (?, ?)",
      [user, description]
    );
    res.redirect("/task"); // Redirect to tasks page after successful submission
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding task");
  }
});



module.exports = router;

