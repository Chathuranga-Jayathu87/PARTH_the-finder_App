// // Server 

// const express = require('express');
// const bodyParser = require('body-parser');
// const http = require('http');  //Require for Socket.IO
// const db = require('./config/db');
// const { log } = require('console');
// require('dotenv').config;


// const { startTrackerServer } = require('./tcp/tracker.tcp');
// const { initializeSocketServer } = require('./socket.manager');

// // -- Import Routes --
// const authRoutes = require('./routes/auth.routes');
// const vehicleRoutes = require('./routes/vehicle.routes');

//     //--Initialize Express App and Server--
// const app = express();
// const server = http.createServer(app);//Create HTTP server from Express App
// const PORT = process.env.PORT || 8080;

// //--- Middleware ---
// app.use(express.json());  //for parsing application/jason
// app.use(bodyParser.urlencoded({ extended: true })); //for parsing application/x-www-form-urlencoded

// // --- API Routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/vehicles', vehicleRoutes);

// //--socket.io Setup (Will be added soon) ---

// // Basic Test Route
// app.get('/', (req, res) => {
    
//     res.json({ message: 'Tracking Backend is online.' });
// });

// db.getConnection()
//     .then(() => {
//         console.log('✅ MySQL Database connected successfully.');

//         // 3. Start the Express HTTP server
//         const httpServer = app.listen(PORT, () => {
//             console.log(`🚀 HTTP Server running on port ${PORT}`);
            
//             // 4. Initialize Socket.IO with the HTTP server
//             initializeSocketServer(httpServer); // <--- NEW CALL

//             // 5. Start the TCP Tracker Server
//             startTrackerServer(); // <--- NEW CALL
//         });
//     })
//     .catch(err => {
//         console.error('❌ Database connection failed:', err);
//         process.exit(1);
//     });



// // --- Start the Server ---
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const db = require('./config/db');
require('dotenv').config();

const { startTrackerServer } = require('./tcp/tracker.tcp');
const { initializeSocketServer } = require('./socket.manager');

// Routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Tracking Backend is online.' });
});

// Connect DB then start server
db.getConnection()
    .then(() => {
        console.log('✅ MySQL Database connected successfully.');

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);

            // Start socket.io and TCP server
            initializeSocketServer(server);
            startTrackerServer();
        });
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    });
