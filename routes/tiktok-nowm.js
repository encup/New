const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.get('/tiktok', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL kosong' });

  exec(`yt-dlp -f mp4 --no-warnings --no-check-certificate -o - "${url}"`, { maxBuffer: 1024 * 1024 * 100 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: 'Gagal fetch TikTok', details: stderr });
    res.setHeader('Content-Type', 'video/mp4');
    res.send(stdout);
  });
});

module.exports = router;
