const net = require("net");

// ⚡ CONFIGURATION
const TCP_HOST = "127.0.0.1";  // TCP server IP
const TCP_PORT = 3000;         // TCP server port
const IMEI = "678490826583647"; // Device IMEI

// Connect to TCP server
const client = new net.Socket();

client.connect(TCP_PORT, TCP_HOST, () => {
  console.log("📡 Connected to TCP tracker server");

  // 1️⃣ Send LOGIN packet
  const loginPacket = `login,imei:${IMEI}\r\n`;
  client.write(loginPacket);
  console.log("➡️ Sent:", loginPacket.trim());
});

// 2️⃣ Send random GPS & random alerts every 5 seconds
setInterval(() => {
  const lat = 6.9271 + Math.random() * 0.02;
  const lng = 79.8612 + Math.random() * 0.02;
  const speed = Math.floor(Math.random() * 100); // km/h

  const gpsPacket = `gps,${lat},${lng},${speed},acc on,fuel:75\r\n`;
  client.write(gpsPacket);
  console.log("📍 GPS sent:", gpsPacket.trim());

  // 3️⃣ Randomly trigger alerts
  const alerts = [];
  if (speed > 60) alerts.push("OVERSPEED");
  if (Math.random() < 0.05) alerts.push("SOS");          // 5% chance
  if (Math.random() < 0.1) alerts.push("LOW_BATTERY");   // 10% chance
  if (Math.random() < 0.05) alerts.push("GEOFENCE_EXIT"); // 5% chance

  alerts.forEach(alert => {
    const alertPacket = `alert,${alert},${lat},${lng}\r\n`;
    client.write(alertPacket);
    console.log("🚨 Alert sent:", alertPacket.trim());
  });

}, 5000);

// 4️⃣ Handle server responses
client.on("data", (data) => {
  console.log("📥 Server ACK:", data.toString().trim());
});

client.on("close", () => {
  console.log("❌ Connection closed");
});

client.on("error", (err) => {
  console.error("❗ TCP Error:", err.message);
});
