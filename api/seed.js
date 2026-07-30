const bcrypt = require('bcryptjs');
const db = require('./db');

// Categories
const { c: catCount } = db.prepare('SELECT COUNT(*) as c FROM categories').get();
if (catCount === 0) {
  const cats = [
    { slug: 'railings',  label: 'מעקות ומדרגות',    sort_order: 0 },
    { slug: 'furniture', label: 'ריהוט',             sort_order: 1 },
    { slug: 'garden',    label: 'גינה',              sort_order: 2 },
    { slug: 'special',   label: 'יצירות מיוחדות',   sort_order: 3 },
  ];
  const insert = db.prepare('INSERT INTO categories (slug, label, sort_order) VALUES (?, ?, ?)');
  cats.forEach(c => insert.run(c.slug, c.label, c.sort_order));
  console.log(`Seeded ${cats.length} categories`);
} else {
  console.log(`Categories already has ${catCount} entries`);
}

// Admin user
const existingUser = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');
if (!existingUser) {
  const hash = bcrypt.hashSync('eran2024', 10);
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('Created admin user  →  admin / eran2024');
  console.log('⚠️  Change the password in production!');
} else {
  console.log('Admin user already exists');
}

// Gallery items
const { c: galleryCount } = db.prepare('SELECT COUNT(*) as c FROM gallery_items').get();
if (galleryCount === 0) {
  const items = [
    { src: 'gallery/railing-ornate.png',     label: 'מעקה קלאסי',               category: 'railings'  },
    { src: 'gallery/staircase-1.png',        label: 'מדרגות מודרניות',           category: 'railings'  },
    { src: 'gallery/staircase-2.png',        label: 'מדרגות עם פאנל רשת',       category: 'railings'  },
    { src: 'gallery/shelf-mesh.png',         label: 'ספרייה מרשת ברזל',         category: 'furniture' },
    { src: 'gallery/table-glass.png',        label: 'שולחן זכוכית — בסיס ברזל', category: 'furniture' },
    { src: 'gallery/stools-display.png',     label: 'שרפרפים ומתלים',           category: 'furniture' },
    { src: 'gallery/table-glass-2.png',      label: 'שולחן ברזל וזכוכית',       category: 'furniture' },
    { src: 'gallery/table-bases.png',        label: 'בסיסי בר — עיצוב אישי',    category: 'furniture' },
    { src: 'gallery/tables-round.png',       label: 'שולחנות עגולים עץ וברזל',  category: 'furniture' },
    { src: 'gallery/furniture-showroom.png', label: 'תצוגת ריהוט',              category: 'furniture' },
    { src: 'gallery/chair-outdoor.png',      label: 'כורסת גן',                 category: 'garden'    },
    { src: 'gallery/sofa-outdoor.png',       label: 'פינת ישיבה לגינה',         category: 'garden'    },
    { src: 'gallery/panel-large.png',        label: 'קיר ברזל — פרויקט מיוחד',  category: 'special'   },
  ];
  const insert = db.prepare('INSERT INTO gallery_items (src, label, category, sort_order) VALUES (?, ?, ?, ?)');
  items.forEach((item, i) => insert.run(item.src, item.label, item.category, i));
  console.log(`Seeded ${items.length} gallery items`);
} else {
  console.log(`Gallery already has ${galleryCount} items`);
}

// Testimonials
const { c: testimonialCount } = db.prepare('SELECT COUNT(*) as c FROM testimonials').get();
if (testimonialCount === 0) {
  const testimonials = [
    {
      author: 'דנה ואלי כהן',
      role: 'רחובות',
      text: 'ערן יצר לנו שער כניסה מדהים לבית. הקשיב לכל בקשה, הציע רעיונות יצירתיים ועמד בלוח הזמנים. התוצאה עלתה על כל ציפייה.',
      stars: 5,
    },
    {
      author: 'מיכל לוי',
      role: 'תל אביב',
      text: 'פניתי לערן לעיצוב מעקה מדרגות מיוחד. הוא הפך רעיון מעורפל לפריט אמנות שכל מי שנכנס אלינו מתפעל ממנו. מקצוענות ואדיבות ברמה הגבוהה ביותר.',
      stars: 5,
    },
    {
      author: 'יוסי אברהם',
      role: 'ירושלים',
      text: 'הזמנתי שולחן ברזל לגינה — פריט שמחזיק כבר 5 שנים ועדיין נראה כחדש. ערן יודע לשלב בין חוזק החומר לאסתטיקה עדינה. ממליץ בחום.',
      stars: 5,
    },
  ];
  const insert = db.prepare('INSERT INTO testimonials (author, role, text, stars, sort_order) VALUES (?, ?, ?, ?, ?)');
  testimonials.forEach((t, i) => insert.run(t.author, t.role, t.text, t.stars, i));
  console.log(`Seeded ${testimonials.length} testimonials`);
} else {
  console.log(`Testimonials already has ${testimonialCount} entries`);
}

console.log('Seed complete.');
process.exit(0);
