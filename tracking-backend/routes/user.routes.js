const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');
const bcrypt = require('bcrypt');

// Apply authentication middleware to all routes in this router
router.use(authMiddleware);
console.log("User Routes Loaded");

// Configure how files are stored
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists in your root!
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
    

        //Password validation function
      const isValidPassword = (password) => {
        if(typeof password !== 'string') {
            return false;
        }
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;
        return passwordRegex.test(password) && password.length >= 8 && password.length <= 128;
    };




router.put('/update-profile', upload.single('profile_image'), async (req, res) => {
    const userId = req.user.user_id; // From token
    const { name, phone } = req.body;

    try {
        // 1. Get the OLD image path before updating
        const [rows] = await db.execute("SELECT profile_image FROM users WHERE user_id = ?", [userId]);
        const oldImagePath = rows[0]?.profile_image;

        let query, params;

        if (req.file) {
            const newImagePath = `/uploads/${req.file.filename}`;
            query = "UPDATE users SET name = ?, phone_number = ?, profile_image = ?, created_at = ? WHERE user_id = ?";
            params = [name, phone, newImagePath, new Date(), userId];

            // 2. DELETE the old file from the disk if it exists
            if (oldImagePath) {
                // Construct the full path to the file
                // __dirname is usually the 'routes' folder, so we go up one level to 'uploads'
                const fullOldPath = path.join(__dirname, '..', oldImagePath); 

                fs.unlink(fullOldPath, (err) => {
                    if (err) console.log("Failed to delete old image:", err.message);
                    else console.log("Old image deleted successfully");
                });
            }
        } else {
            query = "UPDATE users SET name = ?, phone_number = ?, created_at = ? WHERE user_id = ?";
            params = [name, phone, new Date(), userId];
        }

        await db.execute(query, params);
        res.json({ success: true, message: 'Profile updated and old image cleaned up!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET USER PROFILE ROUTE
router.get('/profile', async (req, res) => {
     const userId = req.user.user_id; // From token

    try {
        const [rows] = await db.execute(
            "SELECT name, email, phone_number, profile_image FROM users WHERE user_id = ?", 
            [userId]
        );

        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// CHANGE PASSWORD ROUTE




router.put('/change-password', async (req, res) => {
    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;


    // Validate new password
    if (!isValidPassword(newPassword)) {
        return res.status(400).json({ success: false, message: "New password must be between 8 and 128 characters." });
    }

    try {
        // 1. Get the current hashed password from MySQL
        const [users] = await db.execute("SELECT password_hash FROM users WHERE user_id = ?", [userId]);
        if (users.length === 0) return res.status(404).json({ success: false, message: "User not found" });

        const user = users[0];

        // 2. Verify the old password
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        // 3. Hash the NEW password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 4. Update the database
        await db.execute("UPDATE users SET password_hash = ?, created_at = ? WHERE user_id = ?", [hashedPassword, new Date(), userId]);

        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


router.put('/settings/notifications', async (req, res) => {
    const { key, value } = req.body;
    const userId = req.user.user_id;
    console.log("Updating notification setting:", key, value);
    // Whitelist keys to prevent SQL injection
    const allowedKeys = ['overspeed_alerts', 'geofence_alerts', 'low_battery_alerts', 'power_cut_alerts', 'sos_alerts', 'vibration_alerts'];
    if (!allowedKeys.includes(key)) return res.status(400).json({ success: false });

    try {
        const query = `
            INSERT INTO user_settings (user_id, ${key}) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE ${key} = ?
        `;
        await db.execute(query, [userId, value, value]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


router.get('/settings/notifications', async (req, res) => {
    const userId = req.user.user_id;

    try {
        const [rows] = await db.execute(
            "SELECT overspeed_alerts, geofence_alerts, low_battery_alerts, power_cut_alerts, sos_alerts, vibration_alerts FROM user_settings WHERE user_id = ?",
            [userId]
        );

        if (rows.length > 0) {
            res.json({ success: true, settings: rows[0] });
        } else {
            res.json({ success: true, settings: { overspeed_alerts: 0, geofence_alerts: 0, low_battery_alerts: 0, power_cut_alerts: 0, sos_alerts: 0, vibration_alerts: 0 } });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;