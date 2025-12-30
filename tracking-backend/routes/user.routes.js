const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

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

// UPDATE PROFILE ROUTE
router.put('/update-profile', upload.single('profile_image'), async (req, res) => {
    const { userId, name, email, phone } = req.body;
    let imagePath = null;

    if (req.file) {
        // Store the relative path in the database
        imagePath = `/uploads/${req.file.filename}`;
    }

    try {
        let query;
        let params;

        if (imagePath) {
            query = "UPDATE users SET name = ?, email = ?, phone = ?, profile_image = ? WHERE id = ?";
            params = [name, email, phone, imagePath, userId];
        } else {
            query = "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?";
            params = [name, email, phone, userId];
        }

        const [result] = await db.execute(query, params);
        
        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            imagePath: imagePath // Return this so the app can update the UI immediately
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Database update failed' });
    }
});

module.exports = router;