const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const ytdlp = require("yt-dlp-exec").raw;
const outputDir = path.join(__dirname, "..", "temp");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// GET /api/ytdlp-mp3?url=...
router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ status: false, message: "URL tidak ditemukan" });

  const fileName = `audio-${Date.now()}.mp3`;
  const outputPath = path.join(outputDir, fileName);

  try {
    const command = ytdlp([
      url,
      "-f", "bestaudio",
      "-x",
      "--audio-format", "mp3",
      "-o", outputPath
    ]);

    command.stdout.on("data", data => console.log("stdout:", data.toString()));
    command.stderr.on("data", data => console.error("stderr:", data.toString()));

    command.on("close", () => {
      res.download(outputPath, "audio.mp3", (err) => {
        if (err) console.error("Error sending file:", err);
        fs.unlink(outputPath, () => {});
      });
    });
  } catch (err) {
    console.error("YTDLP Exec Error:", err);
    res.status(500).json({ status: false, message: "Gagal download audio" });
  }
});

module.exports = router;
