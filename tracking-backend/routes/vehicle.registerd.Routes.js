const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ඔයාගේ නිවැරදි db.js path එක දාන්න
const authMiddleware = require('../middleware/auth.middleware');

// All the Routes authenticate in here
router.use(authMiddleware);
console.log("Vehicle Route Loaded");

router.get('/vehicles', async (req, res) => {
    try {
        const user_id = req.user.user_id;

        console.log("Route Hit!");
        console.log("Searching for vehicles belonging to User ID:", user_id);

        // 💡 MySQL වල ? වෙනුවට Postgres වල $1 පාවිච්චි කරන්න
        const sqlQuery = "SELECT vehicle_id, license_plate, make_model FROM vehicles WHERE user_id = $1";

        // 💡 [results] වෙනුවට { rows } ලෙස destructure කරගන්න
        const { rows } = await db.query(sqlQuery, [user_id]);

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No vehicles found for this user.",
                vehicles: []
            });
        }

        res.status(200).json({
            success: true,
            vehicles: rows // rows array එක කෙලින්ම response එකට යැවීම
        });

    } catch (err) {
        console.error("❌ Database error fetching vehicles:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching vehicles"
        });
    }
});

module.exports = router;