const Document = require('../models/Document');
const htmlTemplate = require('../utils/htmlTemplate');
const pdf = require('html-pdf-node');
const htmlToDocx = require('html-to-docx');

/* ======================
   EXPORT PDF
====================== */
exports.exportPDF = async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (!doc || doc.owner.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const html = htmlTemplate(doc.title, doc.content);

  const file = { content: html };
  const options = { format: 'A4' };

  const pdfBuffer = await pdf.generatePdf(file, options);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${doc.title}.pdf"`
  });

  res.send(pdfBuffer);
};

/* ======================
   EXPORT DOCX
====================== */
exports.exportDOCX = async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (!doc || doc.owner.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const html = htmlTemplate(doc.title, doc.content);

  const docxBuffer = await htmlToDocx(html);

  res.set({
    'Content-Type':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'Content-Disposition': `attachment; filename="${doc.title}.docx"`
  });

  res.send(docxBuffer);
};
