const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const ffmpegPath = require('ffmpeg-static');

const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });
  }

  const tempDir = tmp.dirSync();
  const outputTemplate = path.join(tempDir.name, '%(title)s.%(ext)s');
  const ytdlpPath = path.join(__dirname, '..', 'yt-dlp');

  const args = [
    '-x',
    '--audio-format', 'mp3',
    '--ffmpeg-location', ffmpegPath,
    '-o', outputTemplate,
    url,
  ];

  const ytdlp = spawn(ytdlpPath, args);

  let stderr = '';
  let stdout = '';

  ytdlp.stderr.on('data', (data) => stderr += data.toString());
  ytdlp.stdout?.on('data', (data) => stdout += data.toString());

  ytdlp.on('close', async (code) => {
    if (code !== 0) {
      return res.status(500).json({
        status: false,
        message: 'Gagal download audio',
        debug: { stderr, stdout }
      });
    }

    // Cari file MP3 di folder temp
    const files = fs.readdirSync(tempDir.name).filter(file => file.endsWith('.mp3'));
    if (files.length === 0) {
      return res.status(500).json({
        status: false,
        message: 'File audio tidak ditemukan setelah proses download.',
        debug: { outputDir: tempDir.name, stderr, stdout }
      });
    }

    const filePath = path.join(tempDir.name, files[0]);
    res.download(filePath, files[0], (err) => {
      fs.rmSync(tempDir.name, { recursive: true, force: true });
      if (err) console.error('Error saat mengirim file:', err);
    });
  });
});

module.exports = router;
