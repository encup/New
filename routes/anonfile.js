const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');

router.post('/upload', async (req, res) => {
  const file = req.files?.file;
  if (!file) return res.status(400).json({ error: 'File tidak ditemukan' });

  const form = new FormData();
  form.append('file', file.data, file.name);

  try {
    const response = await axios.post('https://api.anonfiles.com/upload', form, {
      headers: form.getHeaders()
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal upload ke Anonfile', details: err.message });
  }
});

module.exports = router;
