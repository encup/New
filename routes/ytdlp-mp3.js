const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  const tmpFile = tmp.fileSync({ postfix: '.mp3' });
  const outputPath = tmpFile.name;
  const outputTemplate = outputPath.replace(/\.mp3$/, '');

  const ytdlpPath = path.join(__dirname, '..', 'yt-dlp');

  let stderrData = '';
  const ytdlp = spawn(ytdlpPath, [
    '-f', 'bestaudio',
    '-x',
    '--audio-format', 'mp3',
    '--audio-quality', '0',
    '-o', `${outputTemplate}.%(ext)s`,
    url,
  ]);

  ytdlp.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  ytdlp.on('close', (code) => {
    const mp3Exists = fs.existsSync(outputPath);
    const tmpFiles = fs.readdirSync('/tmp');

    if (!mp3Exists) {
      return res.status(500).json({
        status: false,
        message: 'File audio tidak ditemukan setelah proses download.',
        debug: {
          outputPath,
          stderr: stderrData.trim(),
          tmpFiles
        }
      });
    }

    res.download(outputPath, 'audio.mp3', (err) => {
      fs.unlinkSync(outputPath);
      if (err) console.error('Download error:', err);
    });
  });
});

module.exports = router;
