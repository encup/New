const express = require("express");
const router = express.Router();
const { YtDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const ytdlp = new YtDlpWrap();

// pastikan folder "downloads" tersedia
const downloadsDir = path.join(__dirname, "../downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: "URL tidak ditemukan" });

  const filename = `${Date.now()}.mp3`;
  const output = path.join(downloadsDir, filename);

  try {
    await ytdlp.execPromise([
      url,
      "-f", "bestaudio",
      "--extract-audio",
      "--audio-format", "mp3",
      "-o", output
    ]);

    res.download(output, () => {
      fs.unlinkSync(output); // hapus setelah di-download
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Gagal download", error: err.message });
  }
});

module.exports = router;
