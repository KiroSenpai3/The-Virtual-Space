const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173" } // Allow React frontend to connect
});

let players = {}; // Store player positions

io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Assign initial position
    players[socket.id] = { x: 100, y: 100 };

    // Send updated players list to all clients
    io.emit("updatePlayers", players);

    // Listen for movement events from players
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit("updatePlayers", players);
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

// Start the server
server.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
