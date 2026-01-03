const db = require('../config/db');
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

const processAlert = async (userId, deviceId, alarmType) => {
    try {
        const config = ALARM_MAP[alarmType];
        if (!config) return console.log(`[Alert] Unknown alarm type: ${alarmType}`);

        // 1. Log to Alerts History (Always do this)
        await db.execute(
            "INSERT INTO alerts (user_id, device_id, alert_type, message) VALUES (?, ?, ?, ?)",
            [userId, deviceId, alarmType, config.body]
        );

        // 2. Check User Preferences from user_settings table
        const [rows] = await db.execute(
            `SELECT ${config.column} FROM user_settings WHERE user_id = ?`,
            [userId]
        );

        const isEnabled = rows.length > 0 ? rows[0][config.column] : 1; // Default to 1 (On)

        // 3. Send Push Notification if enabled
        if (isEnabled === 1) {
            await sendPushNotification(userId, {
                title: config.title,
                body: config.body,
                data: { alarmType, deviceId }
            });
            console.log(`[Push] Notification sent for ${alarmType} to User ${userId}`);
        }
    } catch (err) {
        console.error("Alert Processing Error:", err);
    }
};

module.exports = { processAlert };