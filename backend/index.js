import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from 'process';
import connection from './db/connectToMongoDb.js';
import { Server } from 'socket.io';
import { addMsgToConversation } from './controllers/msg.controller.js';
import msgsRouter from "./routes/msg.route.js";

const app = express();
const userSocketMap = {}; // Keeps track of connected users
const port = 8080;

// ✅ Enable CORS for Express routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Create HTTP server
const server = http.createServer(app);

// ✅ Enable CORS for socket.io
const io = new Server(server, {
  cors: {
    origin:['http://localhost:3000', 'http://localhost:3001'],  // React app
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('Client connected');

  const username = socket.handshake.query.username;

  console.log('Connected Username:', username);

  if (username) {
    userSocketMap[username] = socket;
    console.log('Current Users:', Object.keys(userSocketMap));
  }

  // ✅ Handle incoming chat messages
  socket.on('chat msg', (msg) => {
    const receiverSocket = userSocketMap[msg.receiver];

    // Emit message to receiver if they're connected
    if (receiverSocket) {
      receiverSocket.emit('chat msg', msg);
    }

    // ✅ Store the message in DB
    addMsgToConversation([msg.sender, msg.receiver], {
      text: msg.text,
      sender: msg.sender,
      receiver: msg.receiver
    });
  });

  // ✅ Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`${username} disconnected`);
    delete userSocketMap[username];
  });
});

// ✅ API routes
app.use('/msgs', msgsRouter);

app.get('/', (req, res) => {
  res.send("Main backend page");
});

// ✅ Start server and connect to MongoDB
server.listen(port, () => {
  connection();
  console.log(`Server is running at http://localhost:${port}`);
});
