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


const currentDir = path.resolve(process.cwd());

const publicDir = path.join(currentDir, 'public'); // path to the public folder
const dbFilePath = path.join(currentDir, 'db.json'); // added dbFilePath

app.use(express.static(publicDir));

// HTML Routes
app.get('/', (req, res) => {
  console.log(`Current Directory: ${currentDir}`);
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/notes', (req, res) => {
  console.log(`Public Directory: ${publicDir}`);
  res.sendFile(path.join(publicDir, 'notes.html'));
});

// API Routes

// Get all notes
app.get('/api/notes', (req, res) => {
  console.log('Fetching all notes.');
  try {
    const notesData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    res.json(notesData);
  } catch (err) {
    console.error('Error reading from db file:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save a new note
app.post('/api/notes', (req, res) => {
  console.log('Saving a new note.');
  const newNote = req.body;
  try {
    const notesData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    newNote.id = uuidv4();
    notesData.push(newNote);
    fs.writeFileSync(dbFilePath, JSON.stringify(notesData));
    res.json(newNote);
  } catch (err) {
    console.error('Error saving note:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  console.log(`Deleting note with ID: ${req.params.id}`);
  try {
    const notesData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    const noteIndex = notesData.findIndex(note => note.id === req.params.id);
    if (noteIndex === -1) {
      return res.status(404).json({ error: "Note not found" });
    }
    notesData.splice(noteIndex, 1);
    fs.writeFileSync(dbFilePath, JSON.stringify(notesData));
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
