const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const router = express.Router();

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: 'URL tidak ditemukan' });

  // Buat path tanpa ekstensi untuk output yt-dlp
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
  });

  ytdlp.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error('yt-dlp exited with code:', code);
      console.error('stderr:', stderrData);
      return res.status(500).json({
        status: false,
        message: 'Gagal download audio',
        error: stderrData.trim()
      });
    }

    if (!fs.existsSync(outputPath)) {
      console.error('File MP3 tidak ditemukan:', outputPath);
      return res.status(500).json({
        status: false,
        message: 'File audio tidak ditemukan setelah proses download.',
        debug: {
          outputPath,
          stderr: stderrData.trim()
        }
      });
    }

    res.download(outputPath, 'audio.mp3', (err) => {
      fs.unlinkSync(outputPath); // hapus file setelah dikirim
      if (err) console.error('Download error:', err);
    });
  });
});

module.exports = router;
