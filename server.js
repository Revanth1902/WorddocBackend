const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const socketHandler = require('./sockets/socketHandler');
const imageRoutes = require('./routes/imageRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
const server = http.createServer(app);

/* ======================
   SOCKET.IO SETUP
====================== */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // <- your frontend URL, e.g., http://localhost:3000
    credentials: true
  }
});

socketHandler(io);

/* ======================
   MIDDLEWARE
====================== */
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.CLIENT_URL, // <- same as above
  credentials: true
}));

/* ======================
   ROUTES
====================== */
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/export', exportRoutes);

/* ======================
   DATABASE CONNECTION
====================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

/* ======================
   START SERVER
====================== */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
