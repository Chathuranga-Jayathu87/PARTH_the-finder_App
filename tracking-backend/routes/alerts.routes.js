// routes/alerts.routes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ඔයාගේ db.js file එක තියෙන තැනට path එක (e.g., ../db)
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
console.log("Vehicle Alerts Loaded.");

// 1. GET ALL UNREAD ALERTS
router.get('/alerts', async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Postgres වලට ගැලපෙන්න ? වෙනුවට $1 දමා, is_read = false ලෙස වෙනස් කර ඇත.
        const sql = `
            SELECT a.*, v.license_plate 
            FROM alerts a 
            JOIN vehicles v ON a.vehicle_id = v.vehicle_id
            WHERE v.user_id = $1 AND a.is_read = false 
            ORDER BY a.created_at DESC`;

        // mysql2 වල [results] වෙනුවට pg වල { rows } ලෙස destructure කරගන්න.
        const { rows } = await db.query(sql, [userId]);

        res.status(200).json({ 
            success: true, 
            alerts: rows 
        });

    } catch (error) {
        console.error("❌ Database Error fetching alerts:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error while fetching alerts." 
        });
    }
});

// 2. MARK ALERT AS READ (UPDATE)
router.put('/alerts/:id', async (req, res) => {
    try {
        const userId = req.user.user_id;
        const alertId = req.params.id;

        // 🔥 CRITICAL CHANGE: Postgres වල UPDATE query එකක් ඇතුළේ JOIN වෙනුවට FROM පාවිච්චි කළ යුතුය.
        // placeholders පිළිවෙලින් $1 සහ $2 ලෙස යොදා ඇත.
        // a.is_read = true ලෙස සකසා ඇත.
        const sql = `
            UPDATE alerts a
            SET is_read = true
            FROM vehicles v
            WHERE a.vehicle_id = v.vehicle_id
              AND a.alert_id = $1 
              AND v.user_id = $2`;

        // Query එක run කිරීම ($1 = alertId, $2 = userId)
        await db.query(sql, [alertId, userId]);

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
});

module.exports = router;