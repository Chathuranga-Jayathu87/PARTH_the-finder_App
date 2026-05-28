const net = require("net");

const TCP_HOST = "127.0.0.1"; // Change if server is remote
const TCP_PORT = 3000;
//const IMEI = "123456789012345"; // Must exist in DB
const IMEI = "864201928374655";

const client = new net.Socket();

client.connect(TCP_PORT, TCP_HOST, () => {
  console.log("📡 Connected to TCP tracker server");

  // 1️⃣ LOGIN PACKET
  const loginPacket = `login,imei:${IMEI}\r\n`;
  client.write(loginPacket);
  console.log("➡️ Sent:", loginPacket.trim());
});

// 2️⃣ SEND GPS EVERY 3 SECONDS
setInterval(() => {
  const lat = 6.9271 + Math.random() * 0.01;
  const lng = 79.8612 + Math.random() * 0.01;
  const speed = Math.floor(Math.random() * 80);

  const gpsPacket = `gps,${lat},${lng},${speed},acc on,fuel:75\r\n`;
  console.log("📍 GPS:", gpsPacket.trim());

  client.write(gpsPacket);
}, 3000);

// 3️⃣ SERVER RESPONSES
client.on("data", (data) => {
  console.log("📥 Server ACK:", data);
});

client.on("close", () => {
  console.log("❌ Connection closed");
});

client.on("error", (err) => {
  console.error("❗ TCP Error:", err.message);
});
