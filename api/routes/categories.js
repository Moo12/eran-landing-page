const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public — used by landing page and admin
router.get('/', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
  res.json(cats);
});

router.post('/', requireAuth, (req, res) => {
  const { slug, label, sort_order } = req.body;
  if (!slug || !label) return res.status(400).json({ error: 'slug and label are required' });
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Slug must be lowercase letters, numbers and hyphens only' });
  }
  try {
    const result = db
      .prepare('INSERT INTO categories (slug, label, sort_order) VALUES (?, ?, ?)')
      .run(slug, label, sort_order ?? 0);
    res.status(201).json({ id: result.lastInsertRowid, slug, label, sort_order: sort_order ?? 0 });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'A category with that slug already exists' });
    }
    throw e;
  }
});

// Only label and sort_order are editable — slug is the FK used in gallery_items
router.put('/:id', requireAuth, (req, res) => {
  const { label, sort_order } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE categories SET label = ?, sort_order = ? WHERE id = ?').run(
    label ?? existing.label,
    sort_order ?? existing.sort_order,
    req.params.id
  );
  res.json({ ...existing, label: label ?? existing.label, sort_order: sort_order ?? existing.sort_order });
});

router.delete('/:id', requireAuth, (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  const { c } = db.prepare('SELECT COUNT(*) as c FROM gallery_items WHERE category = ?').get(cat.slug);
  if (c > 0) {
    return res.status(409).json({ error: `Cannot delete: ${c} image(s) still use this category` });
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
