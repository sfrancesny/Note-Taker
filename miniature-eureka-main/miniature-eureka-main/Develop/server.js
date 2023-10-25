import express from 'express';
import cors from 'cors'; // Import the cors middleware
import fs from 'fs';
import path from 'path';
// import the uuid library for unique IDs
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // uses the cors middleware

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const currentDir = path.dirname(new URL(import.meta.url).pathname);
const publicDir = path.join(currentDir, 'public'); // path to the public folder
const dbFilePath = path.join(currentDir, 'db.json'); // added dbFilePath

app.use(express.static(publicDir));

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(publicDir, 'notes.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  const notesData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));                                                                           
  res.json(notesData);
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  const notesData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));

  newNote.id = uuidv4();  // generates a unique ID
  notesData.push(newNote);

  fs.writeFileSync(dbFilePath, JSON.stringify(notesData));
  res.json(newNote);
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
