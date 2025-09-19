const express = require("express");
const mysql = require("mysql2");
const { faker } = require("@faker-js/faker");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Activa@2904",
  database: "delta_app",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting: ", err);
    return;
  }
  console.log("Connected to MySQL");

  // Seed 100 users if table empty
  connection.query("SELECT COUNT(*) AS total FROM users", (err, results) => {
    if (err) throw err;
    const total = results[0].total;
    if (total < 100) {
      const users = [];
      for (let i = 0; i < 100; i++) {
        users.push([
          faker.internet.username(), // fixed method name
          faker.internet.email(),
          "Activa@2904",
        ]);
      }
      connection.query(
        "INSERT INTO users (username, email, password) VALUES ?",
        [users],
        (err, res) => {
          if (err) throw err;
          console.log("Seeded 100 users with password Activa@2904");
        }
      );
    }
  });
});

// Home route
app.get("/", (req, res) => {
  res.render("home", { message: null });
});

// Show all users
app.get("/users", (req, res) => {
  connection.query("SELECT id, username, email FROM users", (err, results) => {
    if (err) throw err;
    res.render("users", { users: results });
  });
});

// Add new user
app.post("/add", (req, res) => {
  const { username, email, password } = req.body;
  connection.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    (err) => {
      if (err) throw err;
      res.render("home", { message: "✅ User added successfully!" });
    }
  );
});

// Delete user (check email + password)
app.post("/delete", (req, res) => {
  const { email, password } = req.body;
  connection.query(
    "DELETE FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) {
        return res.render("home", { message: "❌ Incorrect email or password." });
      }
      res.render("home", { message: "🗑️ User deleted successfully!" });
    }
  );
});

// Edit form
app.get("/edit/:id", (req, res) => {
  const { id } = req.params;
  connection.query(
    "SELECT id, username FROM users WHERE id = ?",
    [id],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.send("User not found");
      res.render("edit", { user: results[0] });
    }
  );
});

// Patch route (edit username if password correct)
app.patch("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  connection.query(
    "SELECT password FROM users WHERE id = ?",
    [id],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.send("User not found");

      if (results[0].password !== password) {
        return res.send("❌ Incorrect password. Username not updated.");
      }

      connection.query(
        "UPDATE users SET username = ? WHERE id = ?",
        [username, id],
        (err) => {
          if (err) throw err;
          res.redirect("/users");
        }
      );
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
