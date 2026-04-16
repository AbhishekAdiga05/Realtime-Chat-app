import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

let io;
const userSocketMap = {};

export function initSocket() {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("markDelivered", async ({ messageIds }) => {
      const { markAsDelivered } = await import("../controllers/messageStatus.controller.js");
      for (const messageId of messageIds) {
        await markAsDelivered(messageId, userId);
      }
      if (io) {
        io.to(userId).emit("messagesDelivered", { messageIds, userId });
      }
    });

    socket.on("joinGroup", (groupId) => {
      socket.join(`group:${groupId}`);
      console.log(`User ${userId} joined group: ${groupId}`);
    });

    socket.on("leaveGroup", (groupId) => {
      socket.leave(`group:${groupId}`);
      console.log(`User ${userId} left group: ${groupId}`);
    });

    socket.on("typing", ({ to, isGroup, groupId }) => {
      if (isGroup) {
        socket.to(`group:${groupId}`).emit("userTyping", { userId, groupId });
      } else {
        const receiverSocketId = userSocketMap[to];
        if (receiverSocketId && io) {
          io.to(receiverSocketId).emit("userTyping", { userId, to });
        }
      }
    });

    socket.on("groupUpdated", (data) => {
      socket.broadcast.emit("groupUpdated", data);
    });

    socket.on("memberAdded", (data) => {
      socket.broadcast.emit("memberAdded", data);
    });

    socket.on("memberRemoved", (data) => {
      socket.broadcast.emit("memberRemoved", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      if (userId) {
        delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  return io;
}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export { io, app, server };
