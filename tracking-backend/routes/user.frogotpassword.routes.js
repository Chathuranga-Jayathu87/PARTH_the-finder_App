// const express = require('express');
// const crypto = require('crypto'); // Built-in Node tool for tokens
// const nodemailer = require('nodemailer'); // Tool to send emails
// const User = require('./models/User'); // Your User model
// const router = express.Router();

// // POST /forgot-password
// router.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;

//     try {
//         // 1. Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: "User with this email does not exist." });
//         }

//         // 2. Create a secure random token
//         const resetToken = crypto.randomBytes(32).toString('hex');
        
//         // 3. Save token in DB with an expiry time (e.g., 1 hour)
//         user.resetPasswordToken = resetToken;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
//         await user.save();

//         // 4. Configure Email Transport (Use Gmail, SendGrid, or Mailtrap for testing)
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail', 
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         // 5. Create the Deep Link URL
//         // Format: scheme://path?params
//         const resetUrl = `gpstracker://ResetPassword?token=${resetToken}`;

//         const mailOptions = {
//             to: user.email,
//             from: 'noreply@gpstracker.com',
//             subject: 'GPS Tracker - Password Reset Request',
//             html: `
//                 <div style="font-family: sans-serif; padding: 20px;">
//                     <h2>Password Reset Request</h2>
//                     <p>You requested to reset your password. Please click the button below to continue.</p>
//                     <a href="${resetUrl}" 
//                        style="background: #3f51b5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
//                        Reset Password
//                     </a>
//                     <p>If the button doesn't work, open this link on your phone:</p>
//                     <p>${resetUrl}</p>
//                     <p>This link will expire in 1 hour.</p>
//                 </div>
//             `,
//         };

//         await transporter.sendMail(mailOptions);

//         res.status(200).json({ success: true, message: "Reset link sent to email." });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error. Could not send email." });
//     }
// });

// module.exports = router;



const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/db'); // Your SQL database connection file
const router = express.Router();
require('dotenv').config();
console.log("Frogot pass load");

router.post('/forgot-password', async (req, res) => {
    console.log("Received forgot-password request");
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }



    try {
        // 1. Check if user exists in SQL
        const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: "Email not found." });
        }

        // 2. Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour from now

        // 3. Update the User record with the token
        await db.execute(
            'UPDATE Users SET reset_token = ?, reset_expires = ? WHERE email = ?',
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
    // Use a proper HTML template
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
        console.error(error);
        res.status(500).json({ message: "Database error." });
    }
});

module.exports = router;