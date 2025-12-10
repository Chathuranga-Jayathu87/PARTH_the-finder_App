// test-client.js
const net = require('net');
const SERVER_PORT = 5000;
const TEST_IMEI = '123456789012345'; // MUST match a valid IMEI in your 'vehicles' table

const client = net.createConnection({ port: SERVER_PORT, host: 'localhost' }, () => {
    console.log('--- Connected to Tracker Server ---');
    
    // --- STEP 1: LOGIN PACKET (ASCII format example) ---
    // The packet must match the format your server expects (e.g., ASCII with imei:...)
    const loginPacket = Buffer.from(`*HQ,LOGIN,imei:${TEST_IMEI},STATUS:0#\r\n`, 'ascii');
    
    // Test Case A: Send the complete Login Packet
    console.log('1. Sending LOGIN packet...');
    client.write(loginPacket); 
});

client.on('data', (data) => {
    const response = data.toString('hex');
    console.log(`[Client] Received ACK/NACK: ${response}`);

    if (response.includes('01')) { // 01 is often the ACK (Success) response
        // --- STEP 2: GPS PACKET (Example data) ---
        // Sending a second packet to test continuous data flow
        setTimeout(() => {
            console.log('\n2. Sending LIVE GPS data...');
            // Example GPS data: Lat/Lon/Speed/Time
            const gpsData = Buffer.from(`*HQ,GPS,34.0522,W,118.2437,N,60,${TEST_IMEI},${new Date().toISOString()}#\r\n`, 'ascii');
            client.write(gpsData);

            // --- STEP 3: Split Packet Test (The critical test!) ---
            setTimeout(() => {
                console.log('\n3. Testing SPLIT PACKET...');
                const fullPacket = Buffer.from('*HQ,ALARM,SOS,0.0.0.0,0,0,0,0,0#\r\n', 'ascii');
                const firstHalf = fullPacket.slice(0, 15);
                const secondHalf = fullPacket.slice(15);
                
                // Send the first fragment
                console.log('   - Sending first fragment (15 bytes)');
                client.write(firstHalf);
                
                // Wait a moment (simulating network delay) and send the rest
                setTimeout(() => {
                    console.log('   - Sending remaining fragment');
                    client.write(secondHalf);
                    
                    // All tests done
                    setTimeout(() => client.end(), 1000);
                }, 50);

            }, 2000);

        }, 1000);
    }
});

client.on('error', (err) => {
    console.error(`[Client] Error: ${err.message}`);
});

client.on('close', () => {
    console.log('\n--- Connection Closed ---');
});