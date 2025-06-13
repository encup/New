const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');

router.post('/upload', async (req, res) => {
  const file = req.files?.file;
  if (!file) {
    return res.status(400).json({ status: false, message: 'File tidak ditemukan' });
  }

  const form = new FormData();
  form.append('file', file.data, file.name);

  try {
    const response = await axios.post('https://api.anonfiles.com/upload', form, {
      headers: form.getHeaders()
    });
    res.json({ status: true, result: response.data });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Gagal upload ke Anonfile', error: err.message });
  }
});

module.exports = router;
