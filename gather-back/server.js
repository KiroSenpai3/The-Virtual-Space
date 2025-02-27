const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (update this for production)
  },
});

const players = {}; // Store all players' positions

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Add new player to the list
  players[socket.id] = { x: 1, y: 1, direction: 'down', frame: 0 };

  // Send the current list of players to the new client
  socket.emit('currentPlayers', players);

  // Notify other clients about the new player
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  // Handle player movement
  socket.on('move', (data) => {
    const { x, y, direction, frame } = data;
    players[socket.id] = { x, y, direction, frame };

    // Broadcast the updated position to all clients
    socket.broadcast.emit('playerMoved', { id: socket.id, x, y, direction, frame });
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    delete players[socket.id];

    // Notify other clients about the disconnected player
    io.emit('playerDisconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server is running on port 3000');
});