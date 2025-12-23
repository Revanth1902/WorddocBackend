const Document = require('../models/Document');

/* ======================
   CREATE DOCUMENT
====================== */
exports.createDocument = async (req, res) => {
  const doc = await Document.create({
    owner: req.user._id,
    title: 'Untitled Document',
    content: ''
  });

  res.status(201).json(doc);
};

/* ======================
   GET ALL USER DOCUMENTS
====================== */
exports.getDocuments = async (req, res) => {
  const docs = await Document.find({ owner: req.user._id })
    .sort({ updatedAt: -1 });

  res.json(docs);
};

/* ======================
   GET SINGLE DOCUMENT
====================== */
exports.getDocumentById = async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (!doc || doc.owner.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Document not found' });
  }

  res.json(doc);
};

/* ======================
   UPDATE DOCUMENT
   (Auto-save / Manual Save)
====================== */
exports.updateDocument = async (req, res) => {
  const { content, title, confirmOverwrite } = req.body;

  const doc = await Document.findById(req.params.id);
  if (!doc || doc.owner.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (!confirmOverwrite) {
    return res.status(400).json({
      message: 'Overwrite confirmation required'
    });
  }

  // Save previous version
  doc.previousVersion = {
    content: doc.content,
    updatedAt: doc.updatedAt
  };

  doc.content = content;
  if (title) doc.title = title;
  doc.updatedAt = new Date();

  await doc.save();
  res.json(doc);
};

/* ======================
   UNDO (RESTORE PREVIOUS)
====================== */
exports.undoDocument = async (req, res) => {
  const { confirmUndo } = req.body;

  if (!confirmUndo) {
    return res.status(400).json({
      message: 'Undo confirmation required'
    });
  }

  const doc = await Document.findById(req.params.id);
  if (!doc || doc.owner.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (!doc.previousVersion) {
    return res.status(400).json({ message: 'No previous version available' });
  }

  const current = {
    content: doc.content,
    updatedAt: doc.updatedAt
  };

  doc.content = doc.previousVersion.content;
  doc.updatedAt = new Date();
  doc.previousVersion = current;

  await doc.save();
  res.json(doc);
};

/* ======================
   DELETE DOCUMENT
====================== */
exports.deleteDocument = async (req, res) => {
  const { confirmDelete } = req.body;

  if (!confirmDelete) {
    return res.status(400).json({
      message: 'Delete confirmation required'
    });
  }

  const doc = await Document.findById(req.params.id);
  if (!doc || doc.owner.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Document not found' });
  }

  await doc.deleteOne();
  res.json({ message: 'Document deleted successfully' });
};
