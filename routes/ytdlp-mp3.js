const express = require("express");
const router = express.Router();
const { YtDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const ytdlp = new YtDlpWrap();
const outputDir = path.join(__dirname, "..", "temp");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// GET /ytdlp-mp3?url=...
router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: "URL tidak ditemukan" });

  const outputFile = path.join(outputDir, `audio-${Date.now()}.mp3`);

  try {
    await ytdlp.exec([
      url,
      "-f", "bestaudio",
      "-x",
      "--audio-format", "mp3",
      "-o", outputFile
    ]);

    res.download(outputFile, "audio.mp3", (err) => {
      if (err) console.error("Error sending file:", err);
      fs.unlink(outputFile, () => {}); // Hapus setelah dikirim
    });
  } catch (error) {
    console.error("YTDLP Error:", error);
    res.status(500).json({ status: false, message: "Gagal download audio" });
  }
});

module.exports = router;
