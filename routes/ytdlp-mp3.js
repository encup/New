const express = require("express");
const router = express.Router();
const YtDlpWrap = require("yt-dlp-wrap"); // FIXED: default import
const fs = require("fs");
const path = require("path");

const ytdlp = new YtDlpWrap(); // gunakan path ke yt-dlp kalau perlu

const outputDir = path.join(__dirname, "..", "temp");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

router.get("/", async (req, res) => {
  const url = req.query.url;

  if (!url || !/^https?:\/\/\S+/.test(url)) {
    return res.status(400).json({ status: false, message: "URL tidak valid atau tidak ditemukan" });
  }

  const timestamp = Date.now();
  const outputTemplate = path.join(outputDir, `audio-${timestamp}.%(ext)s`);
  const expectedFilePath = path.join(outputDir, `audio-${timestamp}.mp3`);

  try {
    await ytdlp.execPromise([
      url,
      "-f", "bestaudio",
      "-x",
      "--audio-format", "mp3",
      "-o", outputTemplate
    ]);

    if (!fs.existsSync(expectedFilePath)) {
      return res.status(500).json({ status: false, message: "Gagal memproses file MP3" });
    }

    res.download(expectedFilePath, "audio.mp3", (err) => {
      fs.unlink(expectedFilePath, () => {}); // hapus setelah dikirim
      if (err) console.error("Gagal mengirim file:", err);
    });

  } catch (error) {
    console.error("YTDLP Error:", error);
    return res.status(500).json({ status: false, message: "Gagal download audio" });
  }
});

module.exports = router;
