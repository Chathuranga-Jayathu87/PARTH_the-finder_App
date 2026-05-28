const fetch = require("node-fetch");
const db = require("../config/db"); // ඔයාගේ නිවැරදි db.js path එක දාන්න

async function sendPushNotification(userId, payload) {
  try {
    // ✅ MySQL db.execute වෙනුවට pg වල db.query සහ ? වෙනුවට $1 යොදා ඇත
    // ✅ [rows] වෙනුවට { rows } ලෙස destructure කර ඇත
    const { rows } = await db.query("SELECT expo_push_token FROM users WHERE user_id = $1", [userId]);
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
    console.error("❌ Expo Push Error:", error);
  }
}

module.exports = { sendPushNotification };