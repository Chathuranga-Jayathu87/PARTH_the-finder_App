const db = require('../config/db'); // ඔයාගේ නිවැරදි db.js path එක දාන්න
const { sendPushNotification } = require('./notificationService'); 

// Map tracker alarm types to our database column names
const ALARM_MAP = {
    'SOS': { column: 'sos_alerts', title: '🆘 Emergency SOS', body: 'SOS button has been pressed!' },
    'POWER_CUT': { column: 'power_cut_alerts', title: '🔌 Power Cut', body: 'External power has been disconnected!' },
    'LOW_BATTERY': { column: 'low_battery_alerts', title: '🪫 Low Battery', body: 'Device battery is critically low!' },
    'VIBRATION': { column: 'vibration_alerts', title: '📳 Vibration Alert', body: 'Vehicle vibration detected!' },
    'OVERSPEED': { column: 'overspeed_alerts', title: '🚀 Speeding Alert', body: 'Vehicle has exceeded the speed limit!' },
    'GEOFENCE_EXIT': { column: 'geofence_alerts', title: '📍 Geo-fence Alert', body: 'Vehicle has left the safe zone!' }
};

const processAlert = async (userId, vehicleid, alarmType, lat, lng) => {
    try {
        const config = ALARM_MAP[alarmType];
        if (!config) return console.log(`[Alert] Unknown alarm type: ${alarmType}`);

        console.log(lat, lng);

        // 1. Log to Alerts History (Always do this)
        // 💡 ? වෙනුවට $1 සිට $6 දක්වා placeholders දමා NOW() වෙනුවට CURRENT_TIMESTAMP යොදා ඇත.
        await db.query(
            "INSERT INTO alerts (user_id, vehicle_id, alert_type, message, lat, lng, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)",
            [userId, vehicleid, alarmType, config.body, lat, lng]
        );

        // 2. Check User Preferences from user_settings table
        // 💡 ? වෙනුවට $1 දමා [rows] ලෙස destructure කර ඇත.
        const { rows } = await db.query(
            `SELECT ${config.column} FROM user_settings WHERE user_id = $1`,
            [userId]
        );

        // 💡 Postgres වල boolean (true/false) එන නිසා default එක true (On) ලෙස සකසා ඇත.
        const isEnabled = rows.length > 0 ? rows[0][config.column] : true; 

        // 3. Send Push Notification if enabled
        // 💡 true ද කියා බැලීමට (false නොවේ නම් හෝ true නම්) check එක වෙනස් කර ඇත.
        if (isEnabled !== false) {
            await sendPushNotification(userId, {
                title: config.title,
                body: config.body,
                data: {
                    alarmType,
                    vehicleid,
                    lat,
                    lng
                }
            });
            console.log(`[Push] Notification sent for ${alarmType} to User ${userId}`);
        }
    } catch (err) {
        console.error("❌ Alert Processing Error:", err);
    }
};

module.exports = { processAlert };