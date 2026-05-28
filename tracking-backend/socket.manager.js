const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

let io;

function initializeSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // restrict later
      methods: ["GET", "POST"],
    },
  });

  /* 🔐 SOCKET AUTH MIDDLEWARE */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // attach user to socket
      socket.user = {
  id: decoded.user_id, // 💡 'decoded.id' වෙනුවට 'decoded.user_id' ලෙස සකස් කළා
  email: decoded.email,
};

      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ Socket connected | user=${socket.user.id} | socket=${socket.id}`
    );

    /* JOIN VEHICLE ROOM */
    socket.on("join_vehicle", (vehicleId) => {
      socket.join(`vehicle_${vehicleId}`);
      console.log(
        `🚗 User ${socket.user.id} joined vehicle_${vehicleId}`
      );
    });

    socket.on("disconnect", () => {
      console.log(
        `❌ Socket disconnected | user=${socket.user.id} | socket=${socket.id}`
      );
    });
  });

  console.log("🔐 Secure Socket.IO server initialized");
}

function emitLiveUpdate(vehicleId, gpsData) {
  if (!io) return;

  io.to(`vehicle_${vehicleId}`).emit("vehicle_update", {
    vehicle_id: vehicleId,
    ...gpsData,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  initializeSocketServer,
  emitLiveUpdate,
};
