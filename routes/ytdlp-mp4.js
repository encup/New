
const express = require("express");
const router = express.Router();
const { exec } = require("child_process");
const fs = require("fs");

router.get("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.json({ status: false, message: "URL tidak ditemukan" });

  const output = `downloads/${Date.now()}.mp4`;
  const command = `yt-dlp -f "best[ext=mp4]/best" -o "${output}" "${url}"`;

  exec(command, (err) => {
    if (err) return res.json({ status: false, message: "Gagal download", error: err.message });

    res.download(output, () => {
      fs.unlinkSync(output); // hapus file setelah dikirim
    });
  });
});

module.exports = router;
