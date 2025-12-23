const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const { uploadImage } = require('../controllers/imagesController');

router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  uploadImage
);

module.exports = router;
