const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  exportPDF,
  exportDOCX
} = require('../controllers/exportController');

router.use(authMiddleware);

router.get('/:id/pdf', exportPDF);
router.get('/:id/docx', exportDOCX);

module.exports = router;
