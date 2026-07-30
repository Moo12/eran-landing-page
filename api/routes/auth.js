const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { SECRET, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Returns whether first-run setup is needed (no admin users exist yet)
router.get('/setup-status', (req, res) => {
  const { c } = db.prepare('SELECT COUNT(*) as c FROM admin_users').get();
  res.json({ needsSetup: c === 0 });
});

// Register: open only when no users exist (first-run), or for logged-in admins
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const { c: userCount } = db.prepare('SELECT COUNT(*) as c FROM admin_users').get();
  const isFirstSetup = userCount === 0;

  if (!isFirstSetup) {
    // Require valid JWT for adding subsequent users
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Must be logged in to create additional users' });
    }
    try {
      jwt.verify(header.slice(7), SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, hash);
  const token = jwt.sign({ id: result.lastInsertRowid, username }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token });
});

// List users (protected)
router.get('/users', requireAuth, (req, res) => {
  const users = db.prepare('SELECT id, username, created_at FROM admin_users ORDER BY id ASC').all();
  res.json(users);
});

// Delete user (protected, cannot delete self)
router.delete('/users/:id', requireAuth, (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  const user = db.prepare('SELECT id FROM admin_users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
