const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  // Buat file temporary (tanpa postfix)
  const tmpObj = tmp.fileSync();
  const outputNoExt = tmpObj.name;
  const outputPath = `${outputNoExt}.mp3`;

  const ytdlpPath = path.join(__dirname, '..', 'yt-dlp');

  const ytdlp = spawn(ytdlpPath, [
    '-x',
    '--audio-format', 'mp3',
    '-o', `${outputNoExt}.%(ext)s`,
    url,
  ]);

  let stderrData = '';

  ytdlp.stderr.on('data', (data) => {
    stderrData += data.toString();
    console.error(`yt-dlp stderr: ${data}`);
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ status: false, message: 'Gagal download audio', error: stderrData });
    }

    // Pastikan file mp3 benar-benar ada
    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ status: false, message: 'File audio tidak ditemukan setelah proses download.' });
    }

    res.download(outputPath, 'audio.mp3', (err) => {
      try {
        fs.unlinkSync(outputPath); // hapus file temp setelah dikirim
      } catch (e) {
        console.error('Gagal hapus file:', e);
      }
      if (err) {
        console.error('Download error:', err);
      }
    });
  });
});

module.exports = router;
