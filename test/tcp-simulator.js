const net = require('net');

const HOST = '127.0.0.1';   // or your server IP
const PORT = 3000;          // TCP_PORT
const IMEI = '998877665544332'; // MUST exist in DB

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log('✅ Connected to TCP server');

    // 1️⃣ LOGIN PACKET
    const loginPacket = `login,imei:${IMEI}\r\n`;
    console.log('➡️ Sending LOGIN');
    client.write(loginPacket);

    // 2️⃣ Send GPS after login
    setTimeout(() => {
        const gpsPacket =
            `gps,6.9271,N,79.8612,E,150,fuel:50,acc on\r\n`;
        // speed = 150 km/h  🔥 OVERSPEED
        console.log('➡️ Sending GPS (OVERSPEED)');
        client.write(gpsPacket);
    }, 1500);

    // 3️⃣ Optional SOS / ALARM
    setTimeout(() => {
        const alarmPacket =
            `alarm,sos,6.9271,N,79.8612,E\r\n`;
        console.log('➡️ Sending SOS ALARM');
        client.write(alarmPacket);
    }, 3000);

    // Close after test
    setTimeout(() => {
        console.log('❌ Closing connection');
        client.end();
    }, 5000);
});

client.on('data', (data) => {
    console.log('⬅️ Server Response:', data);
});

client.on('close', () => {
    console.log('🔌 Connection closed');
});

client.on('error', (err) => {
    console.error('❌ Error:', err.message);
});
