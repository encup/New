const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
  res.send('Betabotz Clone API aktif 🚀');
});

// Routes
app.use('/ytdlp-mp3', require('./routes/ytdlp-mp3'));
app.use('/ytdlp-mp4', require('./routes/ytdlp-mp4'));
app.use('/ai', require('./routes/ai'));
app.use('/telegra', require('./routes/telegra'));
app.use('/anonfile', require('./routes/anonfile'));
app.use('/tiktok-nowm', require('./routes/tiktok-nowm'));
app.use('/facebook-instagram', require('./routes/facebook-instagram'));

// Jalankan server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
