const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store drawing and chat history so new clients receive past activity
const drawingHistory = [];
const chatHistory = [];

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  const ip =
    (socket.handshake.headers['x-forwarded-for'] || '')
      .split(',')[0]
      .trim() || socket.handshake.address;
  console.log(`User connected from ${ip}`);

  // Send existing history to the newly connected client
  socket.emit('history', { drawings: drawingHistory, messages: chatHistory });

  socket.on('drawing', (data) => {
    console.log(`Drawing data from ${ip}`);
    drawingHistory.push(data);
    socket.broadcast.emit('drawing', data);
  });

  socket.on('chat message', (msg) => {
    console.log(`Chat message from ${ip}:`, msg);
    chatHistory.push(msg);
    io.emit('chat message', msg);
  });

  socket.on('clear chat', () => {
    chatHistory.length = 0;
    io.emit('clear chat');
  });

  socket.on('clear board', () => {
    drawingHistory.length = 0;
    io.emit('clear board');
  });

  socket.on('announce', (data) => {
    io.emit('announce', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${ip}`);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
