const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authMiddleware);

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.status(200).json({
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeKb: Math.round(req.file.size / 1024)
  });
});

module.exports = router;
