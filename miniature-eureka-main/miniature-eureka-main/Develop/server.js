import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Calculate the directory name based on the current module's URL
const currentDir = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(currentDir, 'public')));

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(currentDir, 'public', 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(currentDir, 'public', 'notes.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  const notesData = JSON.parse(fs.readFileSync(path.join(currentDir, 'db.json'), 'utf8'));
  res.json(notesData);
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  const notesData = JSON.parse(fs.readFileSync(path.join(currentDir, 'db.json'), 'utf8'));

  newNote.id = notesData.length + 1;
  notesData.push(newNote);

  fs.writeFileSync(path.join(currentDir, 'db.json'), JSON.stringify(notesData));
  res.json(newNote);
});

// Start server
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
