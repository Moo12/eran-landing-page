const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: 'name and message are required' });
  }

  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
      },
      body: JSON.stringify({ name, phone, email, message }),
    });

    if (!response.ok) throw new Error(`n8n ${response.status}`);

    res.json({ success: true });
  } catch (err) {
    console.error('[contact]', err.message);
    res.status(502).json({ error: 'Failed to send' });
  }
});

module.exports = router;
