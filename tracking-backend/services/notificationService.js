// const db = require('../config/db');
// const fetch = require('node-fetch');

// // Ensure firebase-admin is initialized in your server.js
// const sendPushNotification = async (userId, payload) => {
//     try {
//         // Fetch the user's FCM Token (Stored when they login to the app)
//         const [rows] = await db.execute("SELECT expo_push_token FROM users WHERE user_id = ?", [userId]);
//         const fcmToken = rows[0]?.expo_push_token;

//         if (!fcmToken) return console.log(`No Expo push token found for User ${userId}`);

//         const message = {
//             to: expoToken,
//             sound: 'default',
//             title: payload.title,
//             body: payload.body,
//             data: payload.data || {},
//         };

//          // 3. Send to Expo Push API
//         const response = await fetch(
//             'https://exp.host/--/api/v2/push/send',
//             {
//                 method: 'POST',
//                 headers: {
//                     Accept: 'application/json',
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(message),
//             }
//         );

//         const result = await response.json();
//         console.log('📤 Expo Push Result:', result);
//     } catch (error) {
//         console.error("Expo Push Error:", error);
//     }
// };

// module.exports = { sendPushNotification };




const fetch = require("node-fetch");
const db = require("../config/db");

async function sendPushNotification(userId, payload) {
  try {
    // ✅ Fetch the Expo push token from your DB
    const [rows] = await db.execute("SELECT expo_push_token FROM users WHERE user_id = ?", [userId]);
    const expoToken = rows[0]?.expo_push_token;

    if (!expoToken) {
      console.log(`No Expo token found for user ${userId}`);
      return;
    }

    const message = {
      to: expoToken,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    };

    // Send via Expo push API
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log("Expo push result:", result);

  } catch (error) {
    console.error("Expo Push Error:", error);
  }
}

module.exports = { sendPushNotification };
