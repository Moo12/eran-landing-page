const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public — fetched by the landing page
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC').all();
  res.json(items);
});

// Protected — admin only
router.post('/', requireAuth, (req, res) => {
  const { author, role, text, stars } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'author and text are required' });
  }
  const result = db
    .prepare('INSERT INTO testimonials (author, role, text, stars) VALUES (?, ?, ?, ?)')
    .run(author, role || '', text, stars || 5);
  res.status(201).json({ id: result.lastInsertRowid, author, role: role || '', text, stars: stars || 5, sort_order: 0 });
});

router.put('/:id', requireAuth, (req, res) => {
  const { author, role, text, stars, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare(
    'UPDATE testimonials SET author = ?, role = ?, text = ?, stars = ?, sort_order = ? WHERE id = ?'
  ).run(
    author ?? existing.author,
    role ?? existing.role,
    text ?? existing.text,
    stars ?? existing.stars,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  res.json({ ...existing, author, role, text, stars, sort_order });
});

router.delete('/:id', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
