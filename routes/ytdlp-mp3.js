const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const outputDir = path.join(__dirname, '..', 'temp');
const ytdlpPath = path.join(__dirname, '..', 'bin', 'yt-dlp');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL kosong' });

  const filename = `audio-${Date.now()}.mp3`;
  const filepath = path.join(outputDir, filename);

  const ytdlp = spawn(ytdlpPath, [
    url,
    '-f', 'bestaudio',
    '-x',
    '--audio-format', 'mp3',
    '-o', filepath
  ]);

  ytdlp.stderr.on('data', data => console.error(data.toString()));
  ytdlp.stdout.on('data', data => console.log(data.toString()));

  ytdlp.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({ status: false, message: 'Gagal download audio' });
    }

    res.download(filepath, 'audio.mp3', err => {
      if (err) console.error(err);
      fs.unlink(filepath, () => {});
    });
  });
});

module.exports = router;
