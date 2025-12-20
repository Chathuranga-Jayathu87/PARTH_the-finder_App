//socket.manager.js

// const {Server} = require("socket.io");
// require('dotenv').config();

// //Store a reference to the io instance
// let io;

// /**
//  * Initializes the Socket.IO server by attaching it to the running HTTP server.
//  * @param {object} httpServer The Node.js HTTP server instance (created by Express).
//  */
// function initializeSocketServer(httpServer) {
//     io = new Server(httpServer, {
//         cors: {
//             origin: process.env.PORT || "http://localhost:3000", //Allow for frontend URL
//             methods: ["GET", "POST"]
//         },
//         pingTimeout: 60000 //1 minute timeout

//     });

//     io.on("connection", (socket) => {
//         console.log(`[Socket.IO] User connected: ${socket.id}`);

//         socket.on("disconnect", () => {
//             console.log(`[Socket.IO] User disconnected: ${socket.id}`);
//         });
//     });
//     console.log("[Socket.IO] Real-time server initialized.");
// }


// /**
//  * Broadcasts a live GPS update to all connected clients.
//  * This function will be called by tracker.tcp.js whenever a LIVE (non-historical) packet arrives.
//  * @param {number} vehicleId The ID of the vehicle that moved.
//  * @param {object} gpsData The full GPS data object (lat, lng, speed, heading, etc.)
//  */

// function emitLiveUpdate(vehicleId, gpsData) {
//     if (!io) return;

//     io.emit("vehicle_update", {
//         vehicle_id: vehicleId,
//         latitude: gpsData.latitude,
//         longitude: gpsData.longitude,
//         speed: gpsData.speed || 0,
//         fuel: gpsData.fuel ?? null,
//         ignition: gpsData.ignition ?? null,
//         heading: gpsData.heading || 0,
//         timestamp: gpsData.timestamp || new Date()
//     });
// }


// /**
//  * Broadcasts a new alert to all connected clients.
//  * @param {number} userId The user ID to whom the alert belongs.
//  * @param {object} alertData The alert details (type, message, location).
//  */

// function emitAlert(userId, alertData) {
//     // if (!io) {

//     //     io.emit(`alert_user_${userId}`,alertData);
//     //     io.emit('new_alert', alertData); //General alert for all users (for testing)
//     // }
    

//     if (!io) {
//   console.warn("Socket not initialized");
//   return;
// }

// io.emit(`alert_user_${userId}`, alertData);
// io.emit("new_alert", alertData);

// }


// module.exports = {
//     initializeSocketServer,
//     emitLiveUpdate,
//     emitAlert
    
// };


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
        id: decoded.id,
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
