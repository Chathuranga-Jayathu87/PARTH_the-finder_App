const db = require('../config/db');
const admin = require('firebase-admin');

// Ensure firebase-admin is initialized in your server.js
const sendPushNotification = async (userId, payload) => {
    try {
        // Fetch the user's FCM Token (Stored when they login to the app)
        const [rows] = await db.execute("SELECT fcm_token FROM users WHERE id = ?", [userId]);
        const fcmToken = rows[0]?.fcm_token;

        if (!fcmToken) return console.log(`No FCM token found for User ${userId}`);

        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            token: fcmToken,
        };

        await admin.messaging().send(message);
    } catch (error) {
        console.error("FCM Error:", error);
    }
};

module.exports = { sendPushNotification };