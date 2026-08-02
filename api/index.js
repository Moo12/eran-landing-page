const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Admin SPA must come before root static so admin/dist takes precedence over admin/index.html
app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
});

// Static files: landing page, gallery images
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: '30d',
  etag: true,
}));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/testimonials', require('./routes/testimonials'));

app.listen(PORT, () => {
  console.log(`Server:  http://localhost:${PORT}`);
  console.log(`Admin:   http://localhost:${PORT}/admin/`);
  console.log(`API:     http://localhost:${PORT}/api/`);
});
