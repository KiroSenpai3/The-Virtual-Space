import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { io } from "socket.io-client";

const Experience = () => {
    const pixiContainer = useRef(null);
    const socket = useRef(null);
    const appRef = useRef(null);
    const players = useRef({});

    useEffect(() => {
        // Create the PixiJS Application
        const app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x1099bb });
        appRef.current = app;
        if (pixiContainer.current) pixiContainer.current.appendChild(app.view);

        // Connect to the backend server
        socket.current = io("http://localhost:3001");

        // Load a placeholder texture for avatars
        const avatarTexture = PIXI.Texture.from("./vite.svg");

        // Listen for player updates from the server
        socket.current.on("updatePlayers", (serverPlayers) => {
            for (let id in players.current) {
                if (!serverPlayers[id]) {
                    app.stage.removeChild(players.current[id]);
                    delete players.current[id];
                }
            }

            for (let id in serverPlayers) {
                if (!players.current[id]) {
                    const sprite = new PIXI.Sprite(avatarTexture);
                    sprite.width = 40;
                    sprite.height = 40;
                    app.stage.addChild(sprite);
                    players.current[id] = sprite;
                }
                players.current[id].x = serverPlayers[id].x;
                players.current[id].y = serverPlayers[id].y;
            }
        });

        // Handle keyboard movement
        const keys = {};
        window.addEventListener("keydown", (e) => (keys[e.key] = true));
        window.addEventListener("keyup", (e) => (keys[e.key] = false));

        app.ticker.add(() => {
            if (!socket.current.id || !players.current[socket.current.id]) return;

            let moved = false;
            if (keys["ArrowUp"]) { players.current[socket.current.id].y -= 2; moved = true; }
            if (keys["ArrowDown"]) { players.current[socket.current.id].y += 2; moved = true; }
            if (keys["ArrowLeft"]) { players.current[socket.current.id].x -= 2; moved = true; }
            if (keys["ArrowRight"]) { players.current[socket.current.id].x += 2; moved = true; }

            if (moved) {
                socket.current.emit("move", {
                    x: players.current[socket.current.id].x,
                    y: players.current[socket.current.id].y
                });
            }
        });

        return () => {
            socket.current.disconnect();
            app.destroy(true);
        };
    }, []);

    return <div ref={pixiContainer} />;
};

export default Experience;
