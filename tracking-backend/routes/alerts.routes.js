// routes/alerts.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
console.log("Vehicle Alerts Loaded.");


router.get('/alerts', async (req, res) => {
    try {
        const userId = req.user.user_id;

        // SQL query to join alerts with vehicles to ensure data privacy
        const sql = `
            SELECT a.*, v.license_plate 
            FROM alerts a 
            JOIN vehicles v ON a.vehicle_id = v.vehicle_id
            WHERE v.user_id = ? 
            ORDER BY a.created_at DESC`;

        // 🚀 Using await with mysql2/promise
        const [results] = await db.query(sql, [userId]);

        // Return the array of results to the mobile app
        res.status(200).json({ 
            success: true, 
            alerts: results 
        });

    } catch (error) {
        console.error("❌ Database Error fetching alerts:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error while fetching alerts." 
        });
    }

});

module.exports = router;