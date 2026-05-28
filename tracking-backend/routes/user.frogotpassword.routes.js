const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/db'); // ඔයාගේ නිවැරදි db.js path එක දාන්න
const router = express.Router();
require('dotenv').config();
console.log("Forgot password routes loaded");

router.post('/forgot-password', async (req, res) => {
    console.log("Received forgot-password request");
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        // 1. Check if user exists (MySQL db.execute වෙනුවට db.query සහ ? වෙනුවට $1)
        // Postgres වල table names සිම්පල් අකුරෙන් තිබීම standard නිසා 'users' ලෙස වෙනස් කර ඇත.
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: "Email not found." });
        }

        // 2. Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour from now

        // 3. Update the User record with the token (? වෙනුවට $1, $2, $3)
        // JavaScript Date value එක (expires) Postgres වල bigint හෝ timestamp එකකට ගැලපෙන ලෙස සාමාන්‍ය විදිහටම වැඩ කරයි.
        await db.query(
            'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3',
            [token, expires, email]
        );

        // 4. Send the Deep Link Email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const resetUrl = `trackingfrontend://ResetPassword?token=${token}`;

        await transporter.sendMail({
            to: email,
            subject: 'Password Reset - GPS Tracker',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p style="color: #666;">You requested to reset your password for the GPS Tracker app. Click the button below to continue:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #3f51b5; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                           Reset Password
                        </a>
                    </div>

                    <p style="color: #999; font-size: 12px;">If the button above doesn't work, please copy and paste this link into your mobile browser:</p>
                    <p style="color: #3f51b5; font-size: 12px; word-break: break-all;">${resetUrl}</p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 11px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        res.json({ success: true, message: "Email sent!" });

    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ message: "Database error." });
    }
});

module.exports = router;