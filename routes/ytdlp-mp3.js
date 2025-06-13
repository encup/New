const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  // Buat file sementara untuk output mp3
  const tmpFile = tmp.fileSync({ postfix: '.mp3' });
  const outputPath = tmpFile.name;
  const ytdlpPath = path.join(__dirname, '..', 'yt-dlp');

  console.log('[INFO] Mulai download audio dari:', url);
  console.log('[INFO] Simpan ke file:', outputPath);

  const ytdlp = spawn(ytdlpPath, [
    '-x',
    '--audio-format', 'mp3',
    '-o', outputPath,
    url,
  ]);

  ytdlp.stderr.on('data', (data) => {
    console.error('[yt-dlp stderr]', data.toString());
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ status: false, message: 'Gagal download audio' });
    }

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ status: false, message: 'File audio tidak ditemukan setelah proses download.' });
    }

    res.download(outputPath, 'audio.mp3', (err) => {
      try {
        fs.unlinkSync(outputPath);
        console.log('[INFO] File sementara dihapus:', outputPath);
      } catch (err) {
        console.warn('[WARNING] Gagal menghapus file tmp:', err.message);
      }

      if (err) {
        console.error('[ERROR] Gagal mengirim file ke user:', err.message);
      }
    });
  });
});

module.exports = router;
