const db = require("../config/db"); // ඔයාගේ db.js file එක තියෙන තැනට path එක නිවැරදි කරගන්න (e.g., ../db)

exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    // MySQL වල [rows] වෙනුවට { rows } ලෙස destructure කරන්න.
    // ? වෙනුවට $1 පාවිච්චි කරන්න.
    // v.is_deleted = 0 වෙනුවට v.is_deleted = false පාවිච්චි කරන්න (Supabase වල boolean නම්).
    const { rows } = await db.query(
      `
      SELECT
        v.vehicle_id,
        v.license_plate,
        v.make_model,

        COALESCE(s.lat, 0) AS lat,
        COALESCE(s.lng, 0) AS lng,
        COALESCE(s.speed, 0) AS speed,
        COALESCE(s.heading, 0) AS heading,
        COALESCE(s.ignition_status, 0) AS ignition_status,
        COALESCE(s.fuel, 0) AS fuel,
        COALESCE(s.online, 0) AS online,
        s.last_fix
      FROM vehicles v
      LEFT JOIN vehicle_status s
        ON s.vehicle_id = v.vehicle_id
      WHERE v.vehicle_id = $1
        AND v.is_deleted = false
      LIMIT 1
      `,
      [id]
    );

    // rows හි දිග 0 නම් vehicle එක නැත
    if (rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // මුල්ම row එක response එක විදිහට යැවීම
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ getVehicleById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};