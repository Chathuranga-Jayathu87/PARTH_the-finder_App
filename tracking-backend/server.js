const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors'); // CORS middleware එක
const db = require('./config/db'); // 💡 ඔයාගේ අලුත් Supabase db.js file එක තියෙන path එක දෙන්න
const path = require('path');
require('dotenv').config();

const { startTrackerServer } = require('./tcp/tracker.tcp');
const { initializeSocketServer } = require('./socket.manager');

// Routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const registerdVehicles = require('./routes/vehicle.registerd.Routes');
const alertsRoutes = require('./routes/alerts.routes');
const usersRoutes = require('./routes/user.routes');
const expoTokenRoutes = require('./routes/expo_token.routes');
const frogortPasswordRoutes = require('./routes/user.frogotpassword.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Cross-Origin Requests allow කිරීම (Mobile app එකට අනිවාර්යයි)
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
// PUBLIC TOKEN NOT REQUIRED
app.use('/api/auth', frogortPasswordRoutes); 

// PROTECTED TOKEN REQUIRED
app.use('/api/auth', authRoutes);      
app.use('/api/vehicles', vehicleRoutes);  
app.use('/api/v1', registerdVehicles);     
app.use('/api/v1', alertsRoutes);  
app.use('/api/users', usersRoutes);  
app.use('/api/users', expoTokenRoutes); 

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Tracking Backend is online.' });
});

// 💡 CRITICAL CHANGE: MySQL db.getConnection() වෙනුවට pg වල db.connect() පාවිච්චි කරන්න
db.connect()
    .then((client) => {
        console.log('✅ Supabase (PostgreSQL) Database connected successfully.');
        client.release(); // Connection check එක ඉවර වූ පසු client ව නිදහස් කරන්න

        // '0.0.0.0' දැමීමෙන් local hotspot ජාලයේ ඇති mobile devices වලටද සර්වර් එක connect කරගත හැක
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);

            // Start socket.io and TCP server
            initializeSocketServer(server);
            startTrackerServer();
        });
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    });