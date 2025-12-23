const jwt = require('jsonwebtoken');
const Document = require('../models/Document');
const User = require('../models/User');

const socketHandler = (io) => {

  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      if (!cookie) return next(new Error('No auth cookie'));

      const token = cookie
        .split('; ')
        .find(c => c.startsWith('token='))
        ?.split('=')[1];

      if (!token) return next(new Error('Unauthorized'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.email}`);

    /* ======================
       JOIN DOCUMENT ROOM
    ====================== */
    socket.on('doc:join', async (documentId) => {
      const doc = await Document.findById(documentId);
      if (!doc) return;

      if (doc.owner.toString() !== socket.user._id.toString()) {
        return;
      }

      socket.join(documentId);
      socket.emit('doc:load', doc.content);
    });

    /* ======================
       DOCUMENT CHANGE
    ====================== */
    socket.on('doc:change', async ({ documentId, content }) => {
      const doc = await Document.findById(documentId);
      if (!doc) return;

      if (doc.owner.toString() !== socket.user._id.toString()) {
        return;
      }

      // Save previous version (auto-save safe)
      doc.previousVersion = {
        content: doc.content,
        updatedAt: doc.updatedAt
      };

      doc.content = content;
      doc.updatedAt = new Date();
      await doc.save();

      socket.to(documentId).emit('doc:update', content);
    });

    /* ======================
       LEAVE DOCUMENT
    ====================== */
    socket.on('doc:leave', (documentId) => {
      socket.leave(documentId);
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.email}`);
    });
  });
};

module.exports = socketHandler;
