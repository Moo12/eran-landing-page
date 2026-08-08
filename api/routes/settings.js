const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_SLOTS = ['hero_image', 'about_image'];

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname) || '.jpg'}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// Public — returns active image src for each slot (consumed by index.html)
router.get('/', (req, res) => {
  const result = {};
  for (const slot of ALLOWED_SLOTS) {
    const row = db.prepare('SELECT src, uploaded_at FROM setting_images WHERE slot = ? AND is_active = 1').get(slot);
    if (row) {
      result[slot] = row.src.startsWith('uploads/') && row.uploaded_at
        ? `${row.src}?v=${row.uploaded_at}`
        : row.src;
    }
  }
  res.json(result);
});

// List all uploaded images for a slot (admin only)
router.get('/:slot/images', requireAuth, (req, res) => {
  const { slot } = req.params;
  if (!ALLOWED_SLOTS.includes(slot)) return res.status(400).json({ error: 'Unknown slot' });
  const images = db.prepare(
    'SELECT id, src, is_active, uploaded_at FROM setting_images WHERE slot = ? ORDER BY uploaded_at DESC, id DESC'
  ).all(slot);
  res.json(images);
});

// Upload a new image and set it as active
router.post('/:slot', requireAuth, (req, res, next) => {
  if (!ALLOWED_SLOTS.includes(req.params.slot)) return res.status(400).json({ error: 'Unknown slot' });
  next();
}, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image is required' });

  const { slot } = req.params;
  const tempPath = req.file.path;
  let filename = req.file.filename;

  try {
    const webpFilename = filename.replace(/\.[^.]+$/, '.webp');
    const webpPath = path.join(UPLOADS_DIR, webpFilename);
    execFileSync('cwebp', ['-q', '85', '-resize', '1600', '0', tempPath, '-o', webpPath]);
    fs.unlinkSync(tempPath);
    filename = webpFilename;
  } catch { /* cwebp not available — keep original */ }

  const src = `uploads/${filename}`;
  const now = Date.now();

  db.prepare('UPDATE setting_images SET is_active = 0 WHERE slot = ?').run(slot);
  const result = db.prepare(
    'INSERT INTO setting_images (slot, src, is_active, uploaded_at) VALUES (?, ?, 1, ?)'
  ).run(slot, src, now);

  res.status(201).json({ id: result.lastInsertRowid, slot, src, is_active: 1, uploaded_at: now });
});

// Set an existing image as active
router.put('/:slot/activate/:id', requireAuth, (req, res) => {
  const { slot, id } = req.params;
  if (!ALLOWED_SLOTS.includes(slot)) return res.status(400).json({ error: 'Unknown slot' });
  const image = db.prepare('SELECT * FROM setting_images WHERE id = ? AND slot = ?').get(id, slot);
  if (!image) return res.status(404).json({ error: 'Image not found' });
  db.prepare('UPDATE setting_images SET is_active = 0 WHERE slot = ?').run(slot);
  db.prepare('UPDATE setting_images SET is_active = 1 WHERE id = ?').run(id);
  res.json({ ...image, is_active: 1 });
});

// Delete a non-active image
router.delete('/:slot/images/:id', requireAuth, (req, res) => {
  const { slot, id } = req.params;
  if (!ALLOWED_SLOTS.includes(slot)) return res.status(400).json({ error: 'Unknown slot' });
  const image = db.prepare('SELECT * FROM setting_images WHERE id = ? AND slot = ?').get(id, slot);
  if (!image) return res.status(404).json({ error: 'Image not found' });
  if (image.is_active) return res.status(400).json({ error: 'לא ניתן למחוק את התמונה הפעילה' });
  if (image.src.startsWith('uploads/')) {
    try { fs.unlinkSync(path.join(__dirname, '../..', image.src)); } catch { /* already gone */ }
  }
  db.prepare('DELETE FROM setting_images WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
