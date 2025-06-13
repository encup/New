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

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ status: false, message: 'File audio tidak ditemukan setelah proses download.' });
    }

    res.download(outputPath, 'audio.mp3', (err) => {
      if (fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
          console.log('File sementara dihapus:', outputPath);
        } catch (e) {
          console.error('Gagal menghapus file:', e);
        }
      } else {
        console.warn('File tidak ditemukan saat ingin dihapus:', outputPath);
      }

      if (err) {
        console.error('Download error:', err);
      }
    });
  });
});

module.exports = router;
