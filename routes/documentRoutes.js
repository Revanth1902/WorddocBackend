const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  undoDocument
} = require('../controllers/documentController');

router.use(authMiddleware);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.post('/:id/undo', undoDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
