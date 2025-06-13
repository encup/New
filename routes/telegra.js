const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

router.post('/upload', async (req, res) => {
  const file = req.files?.file;
  if (!file) return res.status(400).json({ error: 'File tidak ditemukan' });

  const form = new FormData();
  form.append('file', file.data, file.name);

  try {
    const response = await axios.post('https://telegra.ph/upload', form, {
      headers: form.getHeaders()
    });
    res.json({ link: 'https://telegra.ph' + response.data[0].src });
  } catch (err) {
    res.status(500).json({ error: 'Gagal upload', details: err.message });
  }
});

module.exports = router;
