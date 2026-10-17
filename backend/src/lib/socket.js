import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const allowedUrl = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:5173";

const io = new Server(server, {
    cors: {
        origin: [allowedUrl]
    }
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId ? String(socket.handshake.query.userId) : null;
    const userRoom = userId ? `user:${userId}` : null;

    if (userId) {
        const socketIds = userSocketMap.get(userId) || new Set();
        socketIds.add(socket.id);
        userSocketMap.set(userId, socketIds);
        socket.join(userRoom);
    }

    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
        if (userId) {
            const socketIds = userSocketMap.get(userId);
            socketIds?.delete(socket.id);
            if (socketIds?.size === 0) userSocketMap.delete(userId);
        }
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
});

export { io, server, app };