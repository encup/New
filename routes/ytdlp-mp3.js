const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const outputDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  const fileName = `audio-${Date.now()}.mp3`;
  const outputPath = path.join(outputDir, fileName);

  try {
    const process = youtubedl.raw(
      url,
      {
        extractAudio: true,
        audioFormat: 'mp3',
        output: outputPath
      }
    );

    process.stdout.on('data', d => console.log('stdout:', d.toString()));
    process.stderr.on('data', d => console.error('stderr:', d.toString()));

    process.on('close', () => {
      res.download(outputPath, fileName, err => {
        if (err) console.error(err);
        fs.unlink(outputPath, () => {});
      });
    });

  } catch (err) {
    console.error('Error download:', err);
    res.status(500).json({ status: false, message: 'Gagal download audio', error: err.message });
  }
});

module.exports = router;
