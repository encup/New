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

  let stdoutData = '';
  let stderrData = '';

  const ytdlp = spawn(ytdlpPath, [
    '-f', 'bestaudio',
    '-x',
    '--audio-format', 'mp3',
    '--audio-quality', '0',
    '-o', `${outputTemplate}.%(ext)s`,
    url,
  ]);

  ytdlp.stdout.on('data', (data) => {
    stdoutData += data.toString();
  });

  ytdlp.stderr.on('data', (data) => {
    stderrData += data.toString();
  });

  ytdlp.on('close', (code) => {
    const tmpFiles = fs.readdirSync('/tmp');

    const debug = {
      exitCode: code,
      outputPath,
      stdout: stdoutData.trim(),
      stderr: stderrData.trim(),
      tmpFiles,
    };

    if (!fs.existsSync(outputPath)) {
      console.error('File MP3 tidak ditemukan:', outputPath);
      return res.status(500).json({
        status: false,
        message: 'File audio tidak ditemukan setelah proses download.',
        debug,
      });
    }

    res.download(outputPath, 'audio.mp3', (err) => {
      fs.unlinkSync(outputPath);
      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({ status: false, message: 'Gagal mengirim file', debug });
      }
    });
  });
});

module.exports = router;
