const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { text } = req.query;
  if (!text) return res.status(400).json({ error: 'Text kosong' });
  res.json({ response: `Kamu bilang: ${text}` });
});

module.exports = router;
