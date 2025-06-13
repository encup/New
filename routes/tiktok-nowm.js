
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ status: false, message: "URL tidak ditemukan" });

  try {
    const apiUrl = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (data?.video?.nowm) {
      res.json({
        status: true,
        author: data.author,
        description: data.description,
        video_no_watermark: data.video.nowm
      });
    } else {
      res.json({ status: false, message: "Gagal mengambil data video." });
    }
  } catch (err) {
    res.json({ status: false, message: "Terjadi kesalahan", error: err.message });
  }
});

module.exports = router;
