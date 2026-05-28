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
const usersRoutes = require('./routes/user.routes');
const expoTokenRoutes = require('./routes/expo_token.routes');
const frogortPasswordRoutes = require('./routes/user.frogotpassword.routes');


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// API Routes

//PUBLIC TOKEN NOT REQUIRED
app.use('/api/auth', frogortPasswordRoutes); //http://169.254.16.170:5000/api/auth/forgot-password
//PROTECTED TOKEN REQUIRED
app.use('/api/auth', authRoutes);      // http://169.254.16.170:5000/api/auth/login  //http://169.254.16.170:5000/api/auth/register
app.use('/api/vehicles', vehicleRoutes);  //http://169.254.16.170:5000/api/vehicles/register      http://169.254.16.170:5000/api/vehicles/id   
app.use('/api/v1',registerdVehicles);     //http://169.254.16.170:5000/api/v1/vehicles
app.use('/api/v1',alertsRoutes);  //http://169.254.16.170:5000/api/v1/alerts
app.use('/api/users', usersRoutes);  //http://169.254.16.170:5000/api/users/update-profile   //http://169.254.16.170:5000/api/users/profile  //http://172.20.10.30:5000/api/users/change-password  //http://172.20.10.30:5000/api/users/settings/notification
app.use('/api/users', expoTokenRoutes); //http://169.254.16.170:5000/api/users/save-token




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


// const express = require('express');
// const bodyParser = require('body-parser');
// const http = require('http');
// const cors = require('cors'); // 👈 1. CORS මොඩියුල් එක ඉම්පෝර්ට් කළා
// const db = require('./config/db');
// const path = require('path');
// require('dotenv').config();

// const { startTrackerServer } = require('./tcp/tracker.tcp');
// const { initializeSocketServer } = require('./socket.manager');

// // Routes
// const authRoutes = require('./routes/auth.routes');
// const vehicleRoutes = require('./routes/vehicle.routes');
// const registerdVehicles = require('./routes/vehicle.registerd.Routes');
// const alertsRoutes = require('./routes/alerts.routes');
// const usersRoutes = require('./routes/user.routes');
// const expoTokenRoutes = require('./routes/expo_token.routes');
// const frogortPasswordRoutes = require('./routes/user.frogotpassword.routes'); // (පොඩි ස්පෙලින්ග් මිස්ටේක් එකක් තිබ්බා, require එක චෙක් කරගන්න)

// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 8080;

// // Middleware
// app.use(cors()); // 👈 2. හැම රූට් එකකටම කලින් CORS පර්මිෂන් Allow කළා!
// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // API Routes
// app.use('/api/auth', frogortPasswordRoutes);
// app.use('/api/auth', authRoutes);      
// app.use('/api/vehicles', vehicleRoutes);  
// app.use('/api/v1', registerdVehicles);    
// app.use('/api/v1', alertsRoutes);  
// app.use('/api/users', usersRoutes);  
// app.use('/api/users', expoTokenRoutes); 

// // Test route
// app.get('/', (req, res) => {
//     res.json({ message: 'Tracking Backend is online.' });
// });

// // Connect DB then start server
// db.getConnection()
//     .then(() => {
//         console.log('✅ MySQL Database connected successfully.');

//         // 👈 3. '0.0.0.0' ඇතුළත් කළා - එතකොට හොට්ස්පොට් නෙට්වර්ක් එකේ ඉන්න ඔයාගේ ෆෝන් එකට ලැප් එකේ සර්වර් එක පේන්න ගන්නවා
//         server.listen(PORT, '0.0.0.0', () => {
//             console.log(`🚀 Server running on port ${PORT}`);

//             // Start socket.io and TCP server
//             initializeSocketServer(server);
//             startTrackerServer();
//         });
//     })
//     .catch(err => {
//         console.error('❌ Database connection failed:', err);
//         process.exit(1);
//     });