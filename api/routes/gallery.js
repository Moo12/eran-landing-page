const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../gallery'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Public — fetched by the landing page
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM gallery_items ORDER BY sort_order ASC, id ASC').all();
  res.json(items);
});

// Protected — admin only
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  const { label, category } = req.body;
  if (!req.file || !label || !category) {
    return res.status(400).json({ error: 'image, label, and category are required' });
  }
  const src = `gallery/${req.file.filename}`;
  const result = db
    .prepare('INSERT INTO gallery_items (src, label, category) VALUES (?, ?, ?)')
    .run(src, label, category);
  res.status(201).json({ id: result.lastInsertRowid, src, label, category, sort_order: 0 });
});

router.put('/:id', requireAuth, (req, res) => {
  const { label, category, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM gallery_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE gallery_items SET label = ?, category = ?, sort_order = ? WHERE id = ?').run(
    label ?? existing.label,
    category ?? existing.category,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  res.json({ ...existing, label, category, sort_order });
});

router.delete('/:id', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM gallery_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM gallery_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
