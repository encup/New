const express = require("express");
const router = express.Router();
const { YtDlpWrap } = require("yt-dlp-wrap"); // ✅ INI WAJIB BENAR UNTUK V2.x
const fs = require("fs");
const path = require("path");

const ytdlp = new YtDlpWrap();

const downloadsDir = path.join(__dirname, "../downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ status: false, message: "URL tidak ditemukan" });
  }

  const filename = `${Date.now()}.mp3`;
  const outputPath = path.join(downloadsDir, filename);

  try {
    await ytdlp.execPromise([
      url,
      "-f", "bestaudio",
      "--extract-audio",
      "--audio-format", "mp3",
      "-o", outputPath
    ]);

    res.download(outputPath, () => {
      fs.unlinkSync(outputPath); // hapus file setelah didownload
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Gagal download", error: err.message });
  }
});

module.exports = router;
