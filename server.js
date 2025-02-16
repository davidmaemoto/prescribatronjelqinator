const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./patients.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      symptoms TEXT
    )`);
  }
});

// API to get patients by name
app.get('/api/patients', (req, res) => {
  const { name } = req.query;
  const query = `SELECT * FROM patients WHERE name LIKE ?`;
  db.all(query, [`%${name}%`], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// API to add a new patient
app.post('/api/patients', (req, res) => {
  const { name, symptoms } = req.body;
  if (!name || !symptoms) {
    return res.status(400).json({ error: "Name and symptoms are required" });
  }
  
  db.run(`INSERT INTO patients (name, symptoms) VALUES (?, ?)`, [name, JSON.stringify(symptoms)], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, name, symptoms });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
