const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database(':memory:');

// Maak de boeken-tabel
db.serialize(() => {
  db.run(`CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publicationYear INTEGER,
    genre TEXT
  )`);
});

// Routes

// Endpoint: Voeg een nieuw boek toe
app.post('/books', (req, res) => {
  const { title, author, publicationYear, genre } = req.body;

  // Validatie
  if (!title || !author) {
    return res.status(400).json({ error: 'Titel en auteur zijn verplicht.' });
  }

  const query = `INSERT INTO books (title, author, publicationYear, genre) VALUES (?, ?, ?, ?)`;
  db.run(query, [title, author, publicationYear, genre], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, title, author, publicationYear, genre });
  });
});

// Endpoint: Haal alle boeken op
app.get('/books', (req, res) => {
  const { author, genre } = req.query;
  let query = 'SELECT * FROM books';
  const params = [];

  // Filters toepassen
  if (author || genre) {
    query += ' WHERE';
    if (author) {
      query += ' author = ?';
      params.push(author);
    }
    if (genre) {
      query += params.length ? ' AND' : '';
      query += ' genre = ?';
      params.push(genre);
    }
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Endpoint: Haal een specifiek boek op via ID
app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM books WHERE id = ?';
  db.get(query, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Boek niet gevonden.' });
    res.json(row);
  });
});

// Endpoint: Update een boek
app.patch('/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, publicationYear, genre } = req.body;
  const updates = [];
  const params = [];

  if (title) {
    updates.push('title = ?');
    params.push(title);
  }
  if (author) {
    updates.push('author = ?');
    params.push(author);
  }
  if (publicationYear) {
    updates.push('publicationYear = ?');
    params.push(publicationYear);
  }
  if (genre) {
    updates.push('genre = ?');
    params.push(genre);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Geen velden om bij te werken.' });
  }

  params.push(id);

  const query = `UPDATE books SET ${updates.join(', ')} WHERE id = ?`;
  db.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Boek niet gevonden.' });
    res.json({ message: 'Boek bijgewerkt.' });
  });
});

// Endpoint: Verwijder een boek
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM books WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Boek niet gevonden.' });
    res.json({ message: 'Boek verwijderd.' });
  });
});

// Start de server
app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
