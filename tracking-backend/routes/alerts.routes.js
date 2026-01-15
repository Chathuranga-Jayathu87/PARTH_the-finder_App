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
            WHERE v.user_id = ? AND a.is_read = 0 
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


router.put('/alerts/:id', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const alertId = req.params.id;
        // SQL query to update alert as read, ensuring it belongs to the user's vehicle
        const sql = `
            UPDATE alerts a
            JOIN vehicles v ON a.vehicle_id = v.vehicle_id
            SET a.is_read = 1
            WHERE a.alert_id = ? AND v.user_id = ?`;

        // 🚀 Using await with mysql2/promise
        const [results] = await db.query(sql, [alertId, userId]);

        // Return success message to the mobile app
        res.status(200).json({ 
            success: true, 
            message: "Alert marked as read successfully." 
        });

    } catch (error) {
        console.error("❌ Database Error marking alert as read:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error while marking alert as read." 
        });
    }
})

module.exports = router;