const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

//All the Routes authenticate in hear
router.use(authMiddleware);
console.log("Vehicle Route Loaded");
router.get('/vehicles', async (req, res) => {
    try {
        const user_id = req.user.user_id;

        console.log("Route Hit!");
        console.log("Searching for vehicles belonging to User ID:", user_id);

        const sqlQuery = "SELECT vehicle_id, license_plate, make_model FROM vehicles WHERE user_id = ?";

        const [results] = await db.query(sqlQuery, [user_id]);

        if (results.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No vehicles found for this user.",
                vehicles: []
            });
        }
//console.log(res);
        res.status(200).json({
            success: true,
            vehicles: results
        });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching vehicles"
        });
    }
});

module.exports = router;
