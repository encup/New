const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { text } = req.query;
  if (!text) {
    return res.status(400).json({
      status: false,
      message: 'Parameter "text" tidak boleh kosong',
    });
  }

  res.json({
    status: true,
    result: `Kamu bilang: ${text}`
  });
});

module.exports = router;
