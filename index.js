const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use('/ytdlp', require('./routes/ytdlp'));
app.use('/ai', require('./routes/ai'));

app.get('/', (req, res) => {
  res.send('Betabotz Clone API aktif 🚀');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use('/ytdlp', require('./routes/ytdlp-mp3'));
app.use('/telegra', require('./routes/telegra'));
app.use('/anonfile', require('./routes/anonfile'));
app.use('/tiktok-nowm', require('./routes/tiktok-nowm'));
