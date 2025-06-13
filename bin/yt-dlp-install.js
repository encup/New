// bin/yt-dlp-install.js
const fs = require('fs');
const https = require('https');
const path = require('path');
const { chmodSync } = require('fs');

const url = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';
const output = path.join(__dirname, '..', 'yt-dlp');

if (fs.existsSync(output)) {
  console.log('yt-dlp sudah tersedia');
  process.exit(0);
}

console.log('Mengunduh yt-dlp...');
https.get(url, (res) => {
  const file = fs.createWriteStream(output, { mode: 0o755 });
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    chmodSync(output, 0o755);
    console.log('yt-dlp berhasil diunduh');
  });
}).on('error', (err) => {
  console.error('Gagal download yt-dlp:', err.message);
  process.exit(1);
});
