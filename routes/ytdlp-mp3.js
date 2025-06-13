const express = require("express");
const router = express.Router();
const youtubedl = require("yt-dlp-exec");
const fs = require("fs");
const path = require("path");

const downloadsDir = path.join(__dirname, "../downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ status: false, message: "URL tidak ditemukan" });

  const filename = `${Date.now()}.mp3`;
  const output = path.join(downloadsDir, filename);

  try {
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output: output
    });

    res.download(output, () => {
      fs.unlinkSync(output); // hapus file setelah dikirim
    });
  } catch (err) {
    res.json({ status: false, message: "Gagal download", error: err.message });
  }
});

module.exports = router;
