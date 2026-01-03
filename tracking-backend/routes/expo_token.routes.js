const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');


router.use(authMiddleware);
console.log("Expo Token Routes Loaded");


router.post('/save-token', async (req, res) => {
  const { userId, expoPushToken } = req.body;
  if (!userId || !expoPushToken) return res.status(400).send('Missing data');

  try {
    await db.execute(
      `UPDATE users SET expo_push_token = ? WHERE user_id = ?`,
      [expoPushToken, userId]
    );

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


module.exports = router;