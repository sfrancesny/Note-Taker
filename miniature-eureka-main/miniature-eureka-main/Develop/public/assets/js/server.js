const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// HTML Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "notes.html"));
});

// API Routes
app.get("/api/notes", (req, res) => {
  const notesData = JSON.parse(fs.readFileSync("db.json", "utf8"));
  res.json(notesData);
});

app.post("/api/notes", (req, res) => {
  const newNote = req.body;
  const notesData = JSON.parse(fs.readFileSync("db.json", "utf8"));

  newNote.id = notesData.length + 1;
  notesData.push(newNote);

  fs.writeFileSync("db.json", JSON.stringify(notesData));
  res.json(newNote);
});

// Start server
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
