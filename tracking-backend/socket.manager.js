const {Server} = require("socket.io");

//Store a reference to the io instance
let io;

/**
 * Initializes the Socket.IO server by attaching it to the running HTTP server.
 * @param {object} httpServer The Node.js HTTP server instance (created by Express).
 */
function initializeSocketServer(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000", //Allow for frontend URL
            methods: ["GET", "POST"]
        },
        pingTimeout: 60000 //1 minute timeout

    });

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] User connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] User disconnected: ${socket.id}`);
        });
    });
    console.log("[Socket.IO] Real-time server initialized.");
}


/**
 * Broadcasts a live GPS update to all connected clients.
 * This function will be called by tracker.tcp.js whenever a LIVE (non-historical) packet arrives.
 * @param {number} vehicleId The ID of the vehicle that moved.
 * @param {object} gpsData The full GPS data object (lat, lng, speed, heading, etc.)
 */

function emitLiveUpdate(vehicleId, gpsData) {
    if (!io) {
        console.warn("[Socket.IO] Attempted to emit live update before Socket.IO server was initialized.");
        return;
    }

    io.emit('vehicle_update',{
        vehicle_id: vehicleId,
        ...gpsData,
        timestamp: new Date().toISOString()  //Add server timestamp
    });

}

/**
 * Broadcasts a new alert to all connected clients.
 * @param {number} userId The user ID to whom the alert belongs.
 * @param {object} alertData The alert details (type, message, location).
 */

function emitAlert(userId, alertData) {
    if (!io) {

        io.emit(`alert_user_${userId}`,alertData);
        io.emit('new_alert', alertData); //General alert for all users (for testing)
    }
    
}


module.exports = {
    initializeSocketServer,
    emitLiveUpdate,
    emitAlert
    
};