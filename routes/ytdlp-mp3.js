const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const outputDir = path.join(__dirname, '..', 'temp');
const ytdlpPath = path.join(__dirname, '..', 'bin', 'yt-dlp');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  const fileName = `audio-${Date.now()}.mp3`;
  const outputPath = path.join(outputDir, fileName);

  const args = [
    url,
    '-f', 'bestaudio',
    '-x',
    '--audio-format', 'mp3',
    '-o', outputPath
  ];

  const ytdlp = spawn(ytdlpPath, args);

  ytdlp.stderr.on('data', data => console.error(data.toString()));
  ytdlp.stdout.on('data', data => console.log(data.toString()));

  ytdlp.on('close', code => {
    if (code === 0) {
      res.download(outputPath, 'audio.mp3', err => {
        if (err) console.error(err);
        fs.unlink(outputPath, () => {});
      });
    } else {
      console.error(`yt-dlp exited with code ${code}`);
      res.status(500).json({ status: false, message: 'Gagal download audio' });
    }
  });
});

module.exports = router;
