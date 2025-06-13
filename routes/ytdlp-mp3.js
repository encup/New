const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { YtDlpWrap } = require("yt-dlp-wrap");
const ytDlpPath = require("yt-dlp-bin").path; // gunakan yt-dlp dari npm

const ytdlp = new YtDlpWrap(ytDlpPath);
const outputDir = path.join(__dirname, "..", "temp");

// Buat folder temp jika belum ada
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// GET /api/ytdlp-mp3?url=...
router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: "URL tidak ditemukan" });

  const fileName = `audio-${Date.now()}.mp3`;
  const outputFile = path.join(outputDir, fileName);

  try {
    // Eksekusi yt-dlp
    const process = ytdlp.exec([
      url,
      "-f", "bestaudio",
      "-x",
      "--audio-format", "mp3",
      "-o", outputFile
    ]);

    // Log stdout dan stderr untuk debug
    process.stdout.on("data", (data) => console.log("yt-dlp stdout:", data.toString()));
    process.stderr.on("data", (data) => console.error("yt-dlp stderr:", data.toString()));

    await process;

    // Kirim file mp3
    res.download(outputFile, "audio.mp3", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res.status(500).json({ status: false, message: "Gagal mengirim file." });
      }
      // Hapus file setelah selesai dikirim
      fs.unlink(outputFile, () => {});
    });
  } catch (error) {
    console.error("YTDLP Error:", error);
    res.status(500).json({ status: false, message: "Gagal download audio", error: error.message });
  }
});

module.exports = router;
