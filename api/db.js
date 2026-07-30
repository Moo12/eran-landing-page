const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    src TEXT NOT NULL,
    label TEXT NOT NULL,
    category TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    role TEXT DEFAULT '',
    text TEXT NOT NULL,
    stars INTEGER DEFAULT 5,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: add created_at to admin_users if the existing DB predates the column
try {
  db.exec("ALTER TABLE admin_users ADD COLUMN created_at DATETIME");
} catch { /* column already exists */ }

// node:sqlite returns null-prototype objects — wrap prepare to return plain objects
const _prepare = db.prepare.bind(db);
db.prepare = (sql) => {
  const stmt = _prepare(sql);
  const wrap = (fn) => (...args) => {
    const result = fn.apply(stmt, args);
    if (Array.isArray(result)) return result.map(r => ({ ...r }));
    if (result && typeof result === 'object' && !Array.isArray(result) && result.lastInsertRowid !== undefined) return result;
    if (result && typeof result === 'object') return { ...result };
    return result;
  };
  return {
    run: wrap(stmt.run.bind(stmt)),
    get: wrap(stmt.get.bind(stmt)),
    all: wrap(stmt.all.bind(stmt)),
  };
};

module.exports = db;
