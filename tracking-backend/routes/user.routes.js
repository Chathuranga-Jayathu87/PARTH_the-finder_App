const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');

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

// UPDATE PROFILE ROUTE
// router.put('/update-profile', upload.single('profile_image'), async (req, res) => {
//     console.log("Update Profile Route Hit");
//     const userId = req.user.user_id; // Retrieved from auth middleware
//     const { name, email, phone } = req.body;
//     let imagePath = null;

//     if (req.file) {
//         // Store the relative path in the database
//         imagePath = `/uploads/${req.file.filename}`;
//     }

//     try {
//         let query;
//         let params;

//         if (imagePath) {
//             query = "UPDATE users SET name = ?, email = ?, phone_number = ?, profile_image = ? WHERE user_id = ?";
//             params = [name, email, phone, imagePath, userId];
//         } else {
//             query = "UPDATE users SET name = ?, email = ?, phone_number = ? WHERE user_id = ?";
//             params = [name, email, phone, userId];
//         }

//         const [result] = await db.execute(query, params);
        
//         res.json({ 
//             success: true, 
//             message: 'Profile updated successfully',
//             imagePath: imagePath // Return this so the app can update the UI immediately
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, error: 'Database update failed' });
//     }
// });


router.put('/update-profile', upload.single('profile_image'), async (req, res) => {
    const userId = req.user.user_id; // From token
    const { name, email, phone } = req.body;
    
    try {
        // 1. Get the OLD image path before updating
        const [rows] = await db.execute("SELECT profile_image FROM users WHERE user_id = ?", [userId]);
        const oldImagePath = rows[0]?.profile_image;

        let query, params;

        if (req.file) {
            const newImagePath = `/uploads/${req.file.filename}`;
            query = "UPDATE users SET name = ?, email = ?, phone_number = ?, profile_image = ? WHERE user_id = ?";
            params = [name, email, phone, newImagePath, userId];

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
            query = "UPDATE users SET name = ?, email = ?, phone_number = ? WHERE user_id = ?";
            params = [name, email, phone, userId];
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



module.exports = router;