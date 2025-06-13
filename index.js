const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 3000;

app.use(fileUpload());

app.use('/ytdlp', require('./routes/ytdlp'));
app.use('/ytdlp-mp3', require('./routes/ytdlp-mp3'));
app.use('/tiktok-nowm', require('./routes/tiktok-nowm'));
app.use('/telegra', require('./routes/telegra'));
app.use('/anonfile', require('./routes/anonfile'));
app.use('/ai', require('./routes/ai'));

app.get('/', (req, res) => {
  res.send('Betabotz Clone API aktif 🚀');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
