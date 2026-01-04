// tcp/tracker.tcp.js
require('dotenv').config();
const net = require('net');
const db = require('../config/db');
const { emitLiveUpdate, emitAlert } = require('../socket.manager');
const { processAlert } = require('../services/alertProcessor');

const TCP_PORT = process.env.TCP_PORT || 5000;
const CONNECTION_TIMEOUT = 120000; // 2 minutes
const MAX_BUFFER_SIZE = 65536; // 64KB - larger for bulk data
const MAX_PACKETS_PER_BATCH = 100; // Maximum packets to process at once

// Store active client connections
const activeClients = new Map();

// ===========================================
// 1. PROTOCOL CONFIGURATION
// ===========================================
const PROTOCOL = {
    // Packet delimiters - adjust based on your device
    START_MARKER: Buffer.from([0x78, 0x78]),  // Example: GT06
    END_MARKER: Buffer.from([0x0D, 0x0A]),    // \r\n
    
    // Response codes
    ACK: Buffer.from([0x01]),
    NACK: Buffer.from([0x00]),
    
    // Packet types
    TYPES: {
        LOGIN: 'LOGIN',
        GPS: 'GPS',
        GPS_BATCH: 'GPS_BATCH',    // Multiple GPS records
        HEARTBEAT: 'HEARTBEAT',
        ALARM: 'ALARM',
        UNKNOWN: 'UNKNOWN'
    }
};

// ===========================================
// 2. VALIDATION FUNCTIONS
// ===========================================

const isValidIMEI = (imei) => {
    if (!imei || typeof imei !== 'string') {
        return false;
    }
    return /^\d{15}$/.test(imei);
};

const isValidCoordinates = (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return false;
    }
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const isValidSpeed = (speed) => {
    if (speed === undefined || speed === null) return true; // Optional
    return typeof speed === 'number' && speed >= 0 && speed <= 300;
};

const isValidFuelLevel = (fuel) => {
    if (fuel === undefined || fuel === null) return true; // Optional
    return typeof fuel === 'number' && fuel >= 0 && fuel <= 100;
};

const validateGpsData = (data) => {
    const errors = [];

    if (!data) {
        errors.push('No data received.');
        return { isValid: false, errors };
    }

    if (!data.imei || !isValidIMEI(data.imei)) {
        errors.push('Invalid IMEI.');
    }

    if (!isValidCoordinates(data.latitude, data.longitude)) {
        errors.push('Invalid GPS coordinates.');
    }

    if (!isValidSpeed(data.speed)) {
        errors.push('Invalid speed.');
    }

    if (!isValidFuelLevel(data.fuel)) {
        errors.push('Invalid fuel level.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// ===========================================
// 3. TCP SERVER
// ===========================================

const trackerTCPServer = net.createServer((socket) => {
    
    // -------------------------------------------
    // Connection State (Persists for socket life)
    // -------------------------------------------
    const state = {
        isAuthenticated: false,
        imei: null,
        vehicleId: null,
        userId: null,
        
        // IMPORTANT: Buffer for incomplete packets
        buffer: Buffer.alloc(0),
        
        // Statistics
        connectedAt: new Date(),
        lastPacketAt: null,
        packetsReceived: 0,
        batchPacketsReceived: 0,  // Track bulk data packets
        
        // Reconnection tracking
        isReconnection: false,
        previousDisconnectTime: null
    };

    // State template for each connection
    state.lastGps = {
        lat: null,
        lng: null,
        speed: null,
        updatedAt: null
    };

    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[TCP] New connection from ${clientAddress}`);

    // Set socket options
    socket.setTimeout(CONNECTION_TIMEOUT);
    socket.setKeepAlive(true, 30000);

    // -------------------------------------------
    // DATA EVENT - Main Handler
    // -------------------------------------------
    socket.on('data', async (incomingData) => {
        try {
            state.lastPacketAt = new Date();

            // 1. Append incoming data to buffer
            state.buffer = Buffer.concat([state.buffer, incomingData]);

            // 2. Check buffer overflow (protection against attacks)
            if (state.buffer.length > MAX_BUFFER_SIZE) {
                console.log(`[TCP] Buffer overflow from ${state.imei || clientAddress}`);
                state.buffer = Buffer.alloc(0);
                return socket.destroy();
            }

            // 3. Extract and process ALL complete packets from buffer
            await extractAndProcessPackets(socket, state);

        } catch (error) {
            console.error(`[TCP] Error (${state.imei || clientAddress}): ${error.message}`);
        }
    });

    // Timeout handler
    socket.on('timeout', () => {
        console.log(`[TCP] Timeout: ${state.imei || clientAddress}`);
        socket.end();
    });

    // Error handler
    socket.on('error', (error) => {
        console.error(`[TCP] Socket error (${state.imei || clientAddress}): ${error.message}`);
    });

    // Close handler
    socket.on('close', async (hadError) => {
        await handleDisconnection(state, hadError);
    });
});

// ===========================================
// 4. PACKET EXTRACTION (Handles Multiple Packets)
// ===========================================

/**
 * Extract and process all complete packets from buffer
 * This handles:
 * - Multiple packets arriving at once
 * - Partial packets (waits for more data)
 * - Bulk historical data after reconnection
 */
async function extractAndProcessPackets(socket, state) {
    let packetsProcessed = 0;
    let continueProcessing = true;

    while (continueProcessing && packetsProcessed < MAX_PACKETS_PER_BATCH) {
        // Try to extract one complete packet
        const extractionResult = extractOnePacket(state.buffer);

        if (!extractionResult.found) {
            // No complete packet found
            // Keep remaining data in buffer for next data event
            continueProcessing = false;
            
            if (state.buffer.length > 0) {
                console.log(`[TCP] Incomplete packet (${state.buffer.length} bytes) from ${state.imei || 'unknown'}, waiting for more data...`);
            }
        } else {
            // Complete packet found
            const { packet, remaining } = extractionResult;
            
            // Update buffer to remaining data
            state.buffer = remaining;
            
            // Process this packet
            await processSinglePacket(socket, state, packet);
            
            packetsProcessed++;
            state.packetsReceived++;
        }
    }

    if (packetsProcessed > 1) {
        console.log(`[TCP] Batch processed ${packetsProcessed} packets from ${state.imei}`);
        state.batchPacketsReceived += packetsProcessed;
    }

    // If we hit the limit, there might be more packets
    if (packetsProcessed >= MAX_PACKETS_PER_BATCH && state.buffer.length > 0) {
        console.log(`[TCP] More packets pending for ${state.imei}, will process on next cycle`);
        // Use setImmediate to prevent blocking
        setImmediate(() => extractAndProcessPackets(socket, state));
    }
}

/**
 * Extract one complete packet from buffer
 * Returns: { found: boolean, packet: Buffer, remaining: Buffer }
 */
function extractOnePacket(buffer) {
    if (buffer.length === 0) {
        return { found: false, packet: null, remaining: buffer };
    }

    // Method 1: Delimiter-based extraction (\r\n)
    const delimiterResult = extractByDelimiter(buffer, PROTOCOL.END_MARKER);
    if (delimiterResult.found) {
        return delimiterResult;
    }

    // Method 2: Length-prefixed extraction (first 2 bytes = length)
    const lengthResult = extractByLength(buffer);
    if (lengthResult.found) {
        return lengthResult;
    }

    // Method 3: Start/End marker extraction
    const markerResult = extractByMarkers(buffer, PROTOCOL.START_MARKER, PROTOCOL.END_MARKER);
    if (markerResult.found) {
        return markerResult;
    }

    // No complete packet found
    return { found: false, packet: null, remaining: buffer };
}

/**
 * Extract packet by end delimiter
 */
function extractByDelimiter(buffer, delimiter) {
    const delimiterIndex = findBufferIndex(buffer, delimiter);

    if (delimiterIndex === -1) {
        return { found: false, packet: null, remaining: buffer };
    }

    // Include delimiter in packet
    const packetEnd = delimiterIndex + delimiter.length;
    const packet = buffer.slice(0, packetEnd);
    const remaining = buffer.slice(packetEnd);

    return { found: true, packet, remaining };
}

/**
 * Extract packet by length prefix
 */
function extractByLength(buffer) {
    // Need at least 2 bytes for length
    if (buffer.length < 2) {
        return { found: false, packet: null, remaining: buffer };
    }

    // Read packet length from first 2 bytes (Big Endian)
    const packetLength = buffer.readUInt16BE(0);

    // Sanity check
    if (packetLength <= 0 || packetLength > MAX_BUFFER_SIZE) {
        return { found: false, packet: null, remaining: buffer };
    }

    // Check if we have the complete packet
    const totalLength = 2 + packetLength; // 2 bytes for length + data
    if (buffer.length < totalLength) {
        return { found: false, packet: null, remaining: buffer };
    }

    const packet = buffer.slice(0, totalLength);
    const remaining = buffer.slice(totalLength);

    return { found: true, packet, remaining };
}

/**
 * Extract packet by start and end markers
 */
function extractByMarkers(buffer, startMarker, endMarker) {
    const startIndex = findBufferIndex(buffer, startMarker);
    
    if (startIndex === -1) {
        return { found: false, packet: null, remaining: buffer };
    }

    // Search for end marker after start
    const searchFrom = startIndex + startMarker.length;
    const endIndex = findBufferIndex(buffer.slice(searchFrom), endMarker);

    if (endIndex === -1) {
        return { found: false, packet: null, remaining: buffer };
    }

    const packetEnd = searchFrom + endIndex + endMarker.length;
    const packet = buffer.slice(startIndex, packetEnd);
    const remaining = buffer.slice(packetEnd);

    return { found: true, packet, remaining };
}

/**
 * Find buffer/marker index
 */
function findBufferIndex(buffer, marker) {
    for (let i = 0; i <= buffer.length - marker.length; i++) {
        let found = true;
        for (let j = 0; j < marker.length; j++) {
            if (buffer[i + j] !== marker[j]) {
                found = false;
                break;
            }
        }
        if (found) return i;
    }
    return -1;
}

// ===========================================
// 5. PACKET PROCESSING
// ===========================================

async function processSinglePacket(socket, state, packet) {
    const packetType = identifyPacketType(packet);

    console.log(`[TCP] Packet: ${packetType} | Size: ${packet.length} | From: ${state.imei || 'unknown'}`);

    switch (packetType) {
        case PROTOCOL.TYPES.LOGIN:
            await handleLoginPacket(socket, state, packet);
            break;

        case PROTOCOL.TYPES.GPS:
            await handleGpsPacket(socket, state, packet);
            break;

        case PROTOCOL.TYPES.GPS_BATCH:
            await handleGpsBatchPacket(socket, state, packet);
            break;

        case PROTOCOL.TYPES.HEARTBEAT:
            await handleHeartbeatPacket(socket, state, packet);
            break;

        case PROTOCOL.TYPES.ALARM:
            await handleAlarmPacket(socket, state, packet);
            break;

        default:
            // Try to parse as GPS data (most common)
            if (state.isAuthenticated) {
                await handleGpsPacket(socket, state, packet);
            }
            break;
    }
}

/**
 * Identify packet type
 */
function identifyPacketType(packet) {
    const dataString = packet.toString('ascii').toLowerCase();

    // Check for batch/bulk data indicators
    if (dataString.includes('batch') || dataString.includes('bulk') || dataString.includes('history')) {
        return PROTOCOL.TYPES.GPS_BATCH;
    }

    // Check for login
    if (dataString.includes('login') || dataString.includes('imei:')) {
        return PROTOCOL.TYPES.LOGIN;
    }

    // Check for GPS
    if (dataString.includes('gps') || dataString.includes('tracker') || dataString.includes('location')) {
        return PROTOCOL.TYPES.GPS;
    }

    // Check for heartbeat
    if (dataString.includes('heartbeat') || dataString.includes('ping')) {
        return PROTOCOL.TYPES.HEARTBEAT;
    }

    // Check for alarm
    if (dataString.includes('alarm') || dataString.includes('sos') || dataString.includes('alert')) {
        return PROTOCOL.TYPES.ALARM;
    }

    // Binary protocol detection
    if (packet.length >= 4 && packet[0] === 0x78 && packet[1] === 0x78) {
        // GT06 protocol
        const protocolNumber = packet[3];
        switch (protocolNumber) {
            case 0x01: return PROTOCOL.TYPES.LOGIN;
            case 0x12: return PROTOCOL.TYPES.GPS;
            case 0x13: return PROTOCOL.TYPES.HEARTBEAT;
            case 0x16: return PROTOCOL.TYPES.ALARM;
            case 0x14: return PROTOCOL.TYPES.GPS_BATCH; // Batch upload
        }
    }

    return PROTOCOL.TYPES.UNKNOWN;
}

// ===========================================
// 6. LOGIN HANDLER (With Reconnection Detection)
// ===========================================

async function handleLoginPacket(socket, state, packet) {
    try {
        const imei = parseImeiFromPacket(packet);

        if (!imei || !isValidIMEI(imei)) {
            console.log(`[TCP] Invalid IMEI format`);
            sendResponse(socket, 'NACK');
            return socket.end();
        }

        // Check database
        const [rows] = await db.query(
            `SELECT vehicle_id, user_id, is_active 
             FROM vehicles 
             WHERE imei_number = ? AND is_deleted = FALSE`,
            [imei]
        );

        if (rows.length === 0) {
            console.log(`[TCP] Unregistered IMEI: ${imei}`);
            sendResponse(socket, 'NACK');
            return socket.end();
        }

        const vehicle = rows[0];

        if (!vehicle.is_active) {
            console.log(`[TCP] Inactive vehicle: ${imei}`);
            sendResponse(socket, 'NACK');
            return socket.end();
        }

        // Check for existing connection (reconnection scenario)
        if (activeClients.has(imei)) {
            const oldClient = activeClients.get(imei);
            state.isReconnection = true;
            state.previousDisconnectTime = oldClient.lastPacketAt;
            
            console.log(`[TCP] Reconnection detected for ${imei}. Previous session ended at ${oldClient.lastPacketAt}`);
            
            // Close old socket
            oldClient.socket.destroy();
            activeClients.delete(imei);
        }

        // Check if device was offline (from database)
        const [statusRows] = await db.query(
            `SELECT online, last_fix FROM vehicle_status WHERE vehicle_id = ?`,
            [vehicle.vehicle_id]
        );

        if (statusRows.length > 0 && !statusRows[0].online) {
            state.isReconnection = true;
            state.previousDisconnectTime = statusRows[0].last_fix;
            console.log(`[TCP] Device was offline since ${statusRows[0].last_fix}. Expecting historical data.`);
        }

        // Update state
        state.isAuthenticated = true;
        state.imei = imei;
        state.vehicleId = vehicle.vehicle_id;
        state.userId = vehicle.user_id;

        // Store in active clients
        activeClients.set(imei, {
            socket,
            state,
            vehicleId: vehicle.vehicle_id,
            userId: vehicle.user_id
        });

        // Update online status
        await updateOnlineStatus(state.vehicleId, true);

        console.log(`[TCP] LOGIN successful: ${imei} | Reconnection: ${state.isReconnection}`);

        // Send ACK
        sendResponse(socket, 'ACK');

    } catch (error) {
        console.error(`[TCP] Login error: ${error.message}`);
        sendResponse(socket, 'NACK');
        socket.end();
    }
}

// ===========================================
// 7. GPS DATA HANDLER (Single Record)
// ===========================================




async function handleGpsPacket(socket, state, packet) {
    if (!state.isAuthenticated) {
        console.log(`[TCP] GPS from unauthenticated device`);
        return;
    }

    try {
        const gpsData = parseGpsData(packet, state.imei);

        if (!gpsData) {
            console.log(`[TCP] Failed to parse GPS from ${state.imei}`);
            return;
        }

        const validation = validateGpsData(gpsData);

        if (!validation.isValid) {
            console.log(`[TCP] Invalid GPS from ${state.imei}: ${validation.errors.join(', ')}`);
            return;
        }

        // Check if this is historical data
        const isHistorical = isHistoricalData(gpsData.timestamp);

        // Store data
        await storeGpsData(gpsData, state, isHistorical);

        // Update last GPS in state
        if(gpsData){
            state.lastGps = {
                lat: gpsData.latitude,
                lng: gpsData.longitude,
                speed: gpsData.speed,
                updatedAt: new Date()
            };
        }
        

        if (isHistorical) {
            console.log(`[TCP] Historical GPS: ${state.imei} | Time: ${gpsData.timestamp}`);
        } else {
            console.log(`[TCP] Live GPS: ${state.imei} | Lat: ${gpsData.latitude} | Lng: ${gpsData.longitude}`);
        }

        // Send ACK
        sendResponse(socket, 'ACK');

    } catch (error) {
        console.error(`[TCP] GPS error (${state.imei}): ${error.message}`);
    }
}

// ===========================================
// 8. GPS BATCH HANDLER (Multiple Records)
// ===========================================

/**
 * Handle batch/bulk GPS data
 * This is called when device sends stored historical data after reconnection
 */
async function handleGpsBatchPacket(socket, state, packet) {
    if (!state.isAuthenticated) {
        console.log(`[TCP] Batch GPS from unauthenticated device`);
        return;
    }

    try {
        // Parse multiple GPS records from single packet
        const gpsRecords = parseGpsBatchData(packet, state.imei);

        if (!gpsRecords || gpsRecords.length === 0) {
            console.log(`[TCP] Failed to parse batch GPS from ${state.imei}`);
            return;
        }

        console.log(`[TCP] Batch GPS: ${state.imei} | Records: ${gpsRecords.length}`);

        // Store all records
        let successCount = 0;
        let failCount = 0;

        for (const gpsData of gpsRecords) {
            const validation = validateGpsData(gpsData);

            if (validation.isValid) {
                const isHistorical = isHistoricalData(gpsData.timestamp);
                await storeGpsData(gpsData, state, isHistorical);
                successCount++;
            } else {
                failCount++;
            }
        }

        console.log(`[TCP] Batch complete: ${state.imei} | Success: ${successCount} | Failed: ${failCount}`);

        // Send ACK
        sendResponse(socket, 'ACK');

    } catch (error) {
        console.error(`[TCP] Batch GPS error (${state.imei}): ${error.message}`);
    }
}

/**
 * Parse batch GPS data (multiple records in one packet)
 */
function parseGpsBatchData(packet, imei) {
    try {
        const dataString = packet.toString('ascii');
        const records = [];

        // Method 1: JSON array format
        // Example: [{"lat":1.23,"lng":4.56,"time":"2024-01-01T10:00:00"},...]
        if (dataString.trim().startsWith('[')) {
            try {
                const jsonData = JSON.parse(dataString);
                for (const item of jsonData) {
                    records.push({
                        imei,
                        latitude: parseFloat(item.lat) || parseFloat(item.latitude),
                        longitude: parseFloat(item.lng) || parseFloat(item.longitude),
                        speed: parseFloat(item.speed) || 0,
                        heading: parseFloat(item.heading) || 0,
                        ignition: item.ignition,
                        fuel: item.fuel,
                        timestamp: new Date(item.time || item.timestamp)
                    });
                }
                return records;
            } catch (e) {
                // Not valid JSON, try other methods
            }
        }

        // Method 2: Multiple lines (each line = one record)
        // Example: lat,lng,speed,time\nlat,lng,speed,time\n...
        const lines = dataString.split('\n').filter(line => line.trim().length > 0);
        
        for (const line of lines) {
            const parts = line.split(',');
            
            if (parts.length >= 4) {
                records.push({
                    imei,
                    latitude: parseFloat(parts[0]) || 0,
                    longitude: parseFloat(parts[1]) || 0,
                    speed: parseFloat(parts[2]) || 0,
                    heading: parseFloat(parts[3]) || 0,
                    ignition: detectIgnition(line),
                    fuel: parseFuel(line),
                    timestamp: parseTimestamp(parts[4]) || new Date()
                });
            }
        }

        // Method 3: Binary batch format (device specific)
        if (records.length === 0) {
            // Parse binary batch format
            // This depends on your specific device protocol
            const binaryRecords = parseBinaryBatch(packet, imei);
            if (binaryRecords.length > 0) {
                return binaryRecords;
            }
        }

        return records;

    } catch (error) {
        console.error('[TCP] Batch parsing error:', error.message);
        return [];
    }
}

/**
 * Parse binary batch data (example for GT06-like protocol)
 */
function parseBinaryBatch(packet, imei) {
    const records = [];
    
    try {
        // Example: Each record is 20 bytes
        const RECORD_SIZE = 20;
        let offset = 4; // Skip header

        while (offset + RECORD_SIZE <= packet.length - 2) { // -2 for checksum/end
            // Parse one record
            const record = {
                imei,
                latitude: packet.readInt32BE(offset) / 1800000,
                longitude: packet.readInt32BE(offset + 4) / 1800000,
                speed: packet.readUInt8(offset + 8),
                heading: packet.readUInt16BE(offset + 9),
                ignition: (packet.readUInt8(offset + 11) & 0x01) === 1,
                fuel: packet.readUInt8(offset + 12),
                timestamp: parseBinaryTimestamp(packet.slice(offset + 13, offset + 19))
            };

            if (isValidCoordinates(record.latitude, record.longitude)) {
                records.push(record);
            }

            offset += RECORD_SIZE;
        }
    } catch (error) {
        console.error('[TCP] Binary batch parsing error:', error.message);
    }

    return records;
}

/**
 * Parse binary timestamp (6 bytes: YY MM DD HH MM SS)
 */
function parseBinaryTimestamp(buffer) {
    if (buffer.length < 6) return new Date();

    try {
        const year = 2000 + buffer[0];
        const month = buffer[1] - 1;
        const day = buffer[2];
        const hour = buffer[3];
        const minute = buffer[4];
        const second = buffer[5];

        return new Date(year, month, day, hour, minute, second);
    } catch {
        return new Date();
    }
}

// ===========================================
// 9. HEARTBEAT HANDLER
// ===========================================

async function handleHeartbeatPacket(socket, state, packet) {
    if (!state.isAuthenticated) return;

    try {
        await db.query(
            `UPDATE vehicle_status 
             SET online = TRUE, updated_at = NOW() 
             WHERE vehicle_id = ?`,
            [state.vehicleId]
        );

        console.log(`[TCP] Heartbeat: ${state.imei}`);
        sendResponse(socket, 'ACK');

    } catch (error) {
        console.error(`[TCP] Heartbeat error (${state.imei}): ${error.message}`);
    }
}

// ===========================================
// 10. ALARM HANDLER
// ===========================================

// async function handleAlarmPacket(socket, state, packet) {
//     if (!state.isAuthenticated) return;

//     try {

//         const alarmType = parseAlarmType(packet);
//         const gpsData = parseGpsData(packet, state.imei);

//         console.log(`[TCP] Alarm:gpsData`, gpsData?.latitude||null, gpsData?.longitude||null);
//         // Store alarm with GPS data if available
//         await processAlert(state.userId, state.vehicleId, alarmType, gpsData?.latitude || null, gpsData?.longitude || null);
//         // await db.query(
//         //     `INSERT INTO alerts 
//         //      (vehicle_id, user_id, alert_type, message, lat, lng, created_at)
//         //      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
//         //     [
//         //         state.vehicleId,
//         //         state.userId,
//         //         alarmType,
//         //         `Alarm: ${alarmType}`,
//         //         gpsData?.latitude || null,
//         //         gpsData?.longitude || null
//         //     ]
//         // );


//         console.log(`[TCP] Alarm: ${state.imei} | Type: ${alarmType}`);
//         sendResponse(socket, 'ACK');

//     } catch (error) {
//         console.error(`[TCP] Alarm error (${state.imei}): ${error.message}`);
//     }
// }

// async function handleAlarmPacket(socket, state, packet) {
//     if (!state.isAuthenticated) return;

//     try {
//         const alarmType = parseAlarmType(packet);

//         // ✅ Use last GPS if current packet has none
//         const gpsData = parseGpsData(packet, state.imei);
//         const lat = gpsData?.latitude ?? state.lastLat ?? null;
//         const lng = gpsData?.longitude ?? state.lastLng ?? null;

//         await processAlert(state.userId, state.vehicleId, alarmType, lat, lng);

//         console.log(`[TCP] Alarm: ${state.imei} | Type: ${alarmType} | Lat: ${lat} | Lng: ${lng}`);
//         sendResponse(socket, 'ACK');

//     } catch (error) {
//         console.error(`[TCP] Alarm error (${state.imei}): ${error.message}`);
//     }
// }

async function handleAlarmPacket(socket, state, packet) {
  if (!state.isAuthenticated) return;

  const alarmType = parseAlarmType(packet);

  const lat = state.lastGps?.lat ?? null;
  const lng = state.lastGps?.lng ?? null;

  await processAlert(
    state.userId,
    state.vehicleId,
    alarmType,
    lat,
    lng
  );

  console.log(
    `[TCP] Alarm: ${state.imei} | ${alarmType} | Lat: ${lat} | Lng: ${lng}`
  );

  sendResponse(socket, "ACK");
}



// ===========================================
// 11. PARSING FUNCTIONS
// ===========================================

function parseImeiFromPacket(packet) {
    try {
        const dataString = packet.toString('ascii');

        // Pattern: imei:XXXXXXXXXXXXXXX
        const imeiMatch = dataString.match(/imei[:\s]*(\d{15})/i);
        if (imeiMatch) return imeiMatch[1];

        // Pattern: 15 consecutive digits
        const digitMatch = dataString.match(/\d{15}/);
        if (digitMatch) return digitMatch[0];

        // Binary: GT06 protocol
        if (packet.length >= 12 && packet[0] === 0x78 && packet[1] === 0x78) {
            return packet.slice(4, 12).toString('hex');
        }

        return null;

    } catch (error) {
        console.error('[TCP] IMEI parsing error:', error.message);
        return null;
    }
}

function parseGpsData(packet, imei) {
    try {
        const dataString = packet.toString('ascii');
        const parts = dataString.split(',');

        if (parts.length >= 6) {
            // Try to find coordinates
            let latitude = 0;
            let longitude = 0;
            let speed = 0;
            let heading = 0;
            let timestamp = new Date();

            // Standard format: ...,lat,N/S,lng,E/W,speed,...
            for (let i = 0; i < parts.length - 1; i++) {
                const value = parseFloat(parts[i]);
                const direction = parts[i + 1];

                // Coordinate in DDMM.MMMM format
                if (!isNaN(value) && value > 100) {
                    if (direction === 'N' || direction === 'S') {
                        latitude = parseCoordinate(value, direction);
                    } else if (direction === 'E' || direction === 'W') {
                        longitude = parseCoordinate(value, direction);
                    }
                }
                
                // Decimal coordinate
                if (!isNaN(value) && value >= -90 && value <= 90 && latitude === 0) {
                    latitude = value;
                } else if (!isNaN(value) && value >= -180 && value <= 180 && longitude === 0) {
                    longitude = value;
                }
            }

            // Parse speed
            for (const part of parts) {
                const value = parseFloat(part);
                if (!isNaN(value) && value >= 0 && value <= 300) {
                    speed = value;
                    break;
                }
            }

            if (isValidCoordinates(latitude, longitude)) {
                return {
                    imei,
                    latitude,
                    longitude,
                    speed,
                    heading,
                    ignition: detectIgnition(dataString),
                    fuel: parseFuel(dataString),
                    timestamp
                };
            }
        }

        return null;

    } catch (error) {
        console.error('[TCP] GPS parsing error:', error.message);
        return null;
    }
}

function parseCoordinate(value, direction) {
    const degrees = Math.floor(value / 100);
    const minutes = value % 100;
    let decimal = degrees + (minutes / 60);

    if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
    }

    return Math.round(decimal * 1000000) / 1000000;
}

function parseTimestamp(timeString) {
    if (!timeString) return new Date();

    try {
        // Try ISO format
        const isoDate = new Date(timeString);
        if (!isNaN(isoDate.getTime())) {
            return isoDate;
        }

        // Try YYMMDDHHMMSS format
        if (timeString.length >= 12) {
            const year = 2000 + parseInt(timeString.substring(0, 2));
            const month = parseInt(timeString.substring(2, 4)) - 1;
            const day = parseInt(timeString.substring(4, 6));
            const hour = parseInt(timeString.substring(6, 8));
            const minute = parseInt(timeString.substring(8, 10));
            const second = parseInt(timeString.substring(10, 12));

            return new Date(year, month, day, hour, minute, second);
        }

        return new Date();
    } catch {
        return new Date();
    }
}

function detectIgnition(dataString) {
    const lower = dataString.toLowerCase();
    if (lower.includes('acc on') || lower.includes('ignition on')) return true;
    if (lower.includes('acc off') || lower.includes('ignition off')) return false;
    return null;
}

function parseFuel(dataString) {
    const match = dataString.match(/fuel[:\s]*(\d+)/i);
    if (match) {
        const fuel = parseInt(match[1]);
        return fuel >= 0 && fuel <= 100 ? fuel : null;
    }
    return null;
}

function parseAlarmType(packet) {
    const dataString = packet.toString('ascii').toLowerCase();

    if (dataString.includes('sos')) return 'SOS';
    if (dataString.includes('overspeed')) return 'OVERSPEED';
    if (dataString.includes('geofence')) return 'GEOFENCE';
    if (dataString.includes('low battery')) return 'LOW_BATTERY';
    if (dataString.includes('power cut')) return 'POWER_CUT';
    if (dataString.includes('vibration')) return 'VIBRATION';

    return 'UNKNOWN';
}

// ===========================================
// 12. DATA STORAGE
// ===========================================

/**
 * Check if data is historical (older than 1 minute)
 */
function isHistoricalData(timestamp) {
    if (!timestamp || !(timestamp instanceof Date)) return false;
    
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    // Data older than 1 minute is considered historical
    return diff > 60000;
}

/**
 * Store GPS data
 */
async function storeGpsData(data, state, isHistorical = false) {
    const { latitude, longitude, speed, heading, ignition, fuel, timestamp } = data;
    const { vehicleId } = state;

    try {
        // Always insert into historical log
        await db.query(
            `INSERT INTO gps_logs 
             (vehicle_id, lat, lng, speed, heading, ignition_status, fuel, recorded_at, is_historical)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [vehicleId, latitude, longitude, speed || 0, heading || 0, ignition, fuel, timestamp, isHistorical]
        );

        // Only update real-time status if data is live (not historical)
        if (!isHistorical) {
            await db.query(
                `INSERT INTO vehicle_status 
                 (vehicle_id, lat, lng, speed, heading, ignition_status, fuel, last_fix, online)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
                 ON DUPLICATE KEY UPDATE 
                    lat = VALUES(lat),
                    lng = VALUES(lng),
                    speed = VALUES(speed),
                    heading = VALUES(heading),
                    ignition_status = VALUES(ignition_status),
                    fuel = VALUES(fuel),
                    last_fix = VALUES(last_fix),
                    online = TRUE,
                    updated_at = NOW()`,
                [vehicleId, latitude, longitude, speed || 0, heading || 0, ignition, fuel, timestamp]
            );

            // Check alerts only for live data
            await checkAlerts(data, state);
            emitLiveUpdate(vehicleId, data);
        }

    } catch (error) {
        console.error('[TCP] Store GPS error:', error.message);
        throw error;
    }
}

// ===========================================
// 13. ALERTS
// ===========================================

async function checkAlerts(data, state) {
    const { speed } = data;
    const { vehicleId, userId, imei } = state;

    try {
        // Overspeed alert
        const SPEED_LIMIT = 120;
        if (speed && speed > SPEED_LIMIT) {
            await db.query(
                `INSERT INTO alerts (vehicle_id, user_id, alert_type, message, created_at)
                 VALUES (?, ?, 'OVERSPEED', ?, NOW())`,
                [vehicleId, userId, `Speed: ${speed} km/h`]
            );
            console.log(`[ALERT] Overspeed: ${imei} | ${speed} km/h`);
        }

    } catch (error) {
        console.error('[TCP] Alert error:', error.message);
    }
}

// ===========================================
// 14. HELPER FUNCTIONS
// ===========================================

function sendResponse(socket, type, message = '') {
    try {
        if (type === 'ACK') {
            socket.write(PROTOCOL.ACK);
        } else {
            socket.write(PROTOCOL.NACK);
        }
    } catch (error) {
        console.error('[TCP] Send response error:', error.message);
    }
}

async function updateOnlineStatus(vehicleId, isOnline) {
    try {
        await db.query(
            `UPDATE vehicle_status 
             SET online = ?, updated_at = NOW() 
             WHERE vehicle_id = ?`,
            [isOnline, vehicleId]
        );
    } catch (error) {
        console.error('[TCP] Update online status error:', error.message);
    }
}

// ===========================================
// 15. DISCONNECTION HANDLER
// ===========================================

async function handleDisconnection(state, hadError) {
    const duration = Math.round((Date.now() - state.connectedAt.getTime()) / 1000 / 60);

    if (state.imei) {
        console.log(`[TCP] Disconnected: ${state.imei}`);
        console.log(`[TCP] Session: ${duration}min | Packets: ${state.packetsReceived} | Batch: ${state.batchPacketsReceived}`);

        // Update offline status
        await updateOnlineStatus(state.vehicleId, false);

        // Store disconnect time for reconnection detection
        await db.query(
            `UPDATE vehicle_status 
             SET online = FALSE, last_disconnect = NOW() 
             WHERE vehicle_id = ?`,
            [state.vehicleId]
        );

        // Remove from active clients
        activeClients.delete(state.imei);
    }

    console.log(`[TCP] Active connections: ${activeClients.size}`);
}

// ===========================================
// 16. SERVER MANAGEMENT
// ===========================================

function startTrackerServer() {
    trackerTCPServer.listen(TCP_PORT, () => {
        console.log(`[TCP Server] Listening on port ${TCP_PORT}`);
    });

    trackerTCPServer.on('error', (err) => {
        console.error('[TCP Server] Error:', err.message);
    });
}

function stopTrackerServer() {
    return new Promise((resolve) => {
        activeClients.forEach((client) => {
            client.socket.destroy();
        });
        activeClients.clear();

        trackerTCPServer.close(() => {
            console.log('[TCP Server] Stopped');
            resolve();
        });
    });
}

function getActiveClients() {
    const clients = [];
    activeClients.forEach((client, imei) => {
        clients.push({
            imei,
            vehicleId: client.vehicleId,
            userId: client.userId,
            connectedAt: client.state.connectedAt,
            lastPacketAt: client.state.lastPacketAt,
            packetsReceived: client.state.packetsReceived,
            batchPacketsReceived: client.state.batchPacketsReceived,
            isReconnection: client.state.isReconnection
        });
    });
    return clients;
}

function getStats() {
    return {
        activeConnections: activeClients.size,
        clients: getActiveClients()
    };
}

// ===========================================
// 17. EXPORTS
// ===========================================

module.exports = {
    startTrackerServer,
    stopTrackerServer,
    getActiveClients,
    getStats,
    activeClients
};



/*// At the end of tracker.tcp.js
const startServer = () => {
    trackerTCPServer.listen(TCP_PORT, () => {
        console.log(`[TCP] Server ready on port ${TCP_PORT}`);
    });
};
 startServer(); // Uncomment this to run*/