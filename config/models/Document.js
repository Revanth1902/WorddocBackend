const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  content: String,
  updatedAt: Date
});

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Document'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    default: ''
  },
  previousVersion: versionSchema,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
