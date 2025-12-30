const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const db = require('./config/db');
const path = require('path');
require('dotenv').config();

const { startTrackerServer } = require('./tcp/tracker.tcp');
const { initializeSocketServer } = require('./socket.manager');

// Routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const registerdVehicles = require('./routes/vehicle.registerd.Routes');
const alertsRoutes = require('./routes/alerts.routes');
const usersRoutes = require('./routes/users.routes');


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// API Routes
app.use('/api/auth', authRoutes); // come to this point http://172.20.10.3:5000/api/auth/login  //http://172.20.10.3:5000/api/auth/register
app.use('/api/vehicles', vehicleRoutes);  //http://172.20.10.3:5000/api/vehicles/register      http://172.20.10.3:5000/api/vehicles/id   
app.use('/api/v1',registerdVehicles);     //http://172.20.10.3:5000/api/v1/vehicles
app.use('/api/v1',alertsRoutes);  //http://172.20.10.3:5000/api/v1/alerts
app.use('/api/users', usersRoutes);  //http://172.20.10.3:5000/api/users
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
