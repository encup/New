const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const ffmpegPath = require('ffmpeg-static');

const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  const outputDir = tmp.dirSync();
  const outputTemplate = path.join(outputDir.name, '%(title)s.%(ext)s');
  const ytdlpPath = path.join(__dirname, '..', 'yt-dlp');

  let stdoutLog = '', stderrLog = '';

  const ytdlp = spawn(ytdlpPath, [
    '--ffmpeg-location', ffmpegPath,
    '-x',
    '--audio-format', 'mp3',
    '-o', outputTemplate,
    url
  ]);

  ytdlp.stdout.on('data', data => stdoutLog += data.toString());
  ytdlp.stderr.on('data', data => stderrLog += data.toString());

  ytdlp.on('close', code => {
    try {
      const files = fs.readdirSync(outputDir.name).filter(f => f.endsWith('.mp3'));
      if (files.length === 0) {
        return res.status(500).json({
          status: false,
          message: 'File audio tidak ditemukan setelah proses download.',
          debug: { stdout: stdoutLog, stderr: stderrLog }
        });
      }

      const filePath = path.join(outputDir.name, files[0]);
      res.download(filePath, 'audio.mp3', err => {
        fs.unlinkSync(filePath);
        if (err) console.error('Download error:', err);
      });
    } catch (err) {
      return res.status(500).json({ status: false, message: 'Terjadi kesalahan saat memproses file', error: err.message });
    }
  });
});

module.exports = router;
