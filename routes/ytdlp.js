const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.get('/', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL kosong' });

  exec(`yt-dlp --dump-json "${url}"`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: 'Gagal fetch video', details: stderr });

    try {
      const data = JSON.parse(stdout);
      res.json({
        title: data.title,
        duration: data.duration,
        thumbnail: data.thumbnail,
        formats: data.formats.map(f => ({
          quality: f.format,
          ext: f.ext,
          url: f.url
        }))
      });
    } catch (e) {
      res.status(500).json({ error: 'Gagal parse data video' });
    }
  });
});

module.exports = router;
