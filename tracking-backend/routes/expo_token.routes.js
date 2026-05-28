const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ඔයාගේ නිවැරදි db.js path එක දාන්න
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);
console.log("Expo Token Routes Loaded");

router.post('/save-token', async (req, res) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) return res.status(400).send('Missing data');

  try {
    // 💡 MySQL වල db.execute වෙනුවට pg වල db.query පාවිච්චි කරන්න.
    // 💡 ? වෙනුවට $1 සහ $2 placeholders යොදා ඇත.
    await db.query(
      `UPDATE users SET expo_push_token = $1 WHERE user_id = $2`,
      [expoPushToken, req.user.user_id]
    );

    res.send({ success: true });
  } catch (err) {
    console.error("❌ Save Expo Token Error:", err);
    res.status(500).send('Server error');
  }
});

module.exports = router;