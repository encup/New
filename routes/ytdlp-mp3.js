const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  const outputPath = tmp.tmpNameSync({ postfix: '.mp3' });
  const ytdlpPath = path.join(__dirname, '..', 'yt-dlp');

  const ytdlp = spawn(ytdlpPath, [
    '-x',
    '--audio-format', 'mp3',
    '-o', outputPath,
    url,
  ]);

  ytdlp.stderr.on('data', (data) => console.error(`stderr: ${data}`));

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ status: false, message: 'Gagal download audio' });
    }

    res.download(outputPath, 'audio.mp3', (err) => {
      fs.unlinkSync(outputPath);
      if (err) console.error('Download error:', err);
    });
  });
});

module.exports = router;
