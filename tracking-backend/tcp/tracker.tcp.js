// tcp/tracker.tcp.js
require('dotenv').config();
const net = require('net');
const db = require('../config/db'); // 💡 ඔයාගේ නිවැරදි db.js path එක දාන්න
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
    START_MARKER: Buffer.from([0x78, 0x78]),  
    END_MARKER: Buffer.from([0x0D, 0x0A]),    
    
    ACK: Buffer.from([0x01]),
    NACK: Buffer.from([0x00]),
    
    TYPES: {
        LOGIN: 'LOGIN',
        GPS: 'GPS',
        GPS_BATCH: 'GPS_BATCH',    
        HEARTBEAT: 'HEARTBEAT',
        ALARM: 'ALARM',
        UNKNOWN: 'UNKNOWN'
    }
};

// ===========================================
// 2. VALIDATION FUNCTIONS
// ===========================================
const isValidIMEI = (imei) => {
    if (!imei || typeof imei !== 'string') return false;
    return /^\d{15}$/.test(imei);
};

const isValidCoordinates = (lat, lng) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const isValidSpeed = (speed) => {
    if (speed === undefined || speed === null) return true; 
    return typeof speed === 'number' && speed >= 0 && speed <= 300;
};

const isValidFuelLevel = (fuel) => {
    if (fuel === undefined || fuel === null) return true; 
    return typeof fuel === 'number' && fuel >= 0 && fuel <= 100;
};

const validateGpsData = (data) => {
    const errors = [];
    if (!data) {
        errors.push('No data received.');
        return { isValid: false, errors };
    }
    if (!data.imei || !isValidIMEI(data.imei)) errors.push('Invalid IMEI.');
    if (!isValidCoordinates(data.latitude, data.longitude)) errors.push('Invalid GPS coordinates.');
    if (!isValidSpeed(data.speed)) errors.push('Invalid speed.');
    if (!isValidFuelLevel(data.fuel)) errors.push('Invalid fuel level.');

    return { isValid: errors.length === 0, errors };
};

// ===========================================
// 3. TCP SERVER
// ===========================================
const trackerTCPServer = net.createServer((socket) => {
    const state = {
        isAuthenticated: false,
        imei: null,
        vehicleId: null,
        userId: null,
        buffer: Buffer.alloc(0),
        connectedAt: new Date(),
        lastPacketAt: null,
        packetsReceived: 0,
        batchPacketsReceived: 0,  
        isReconnection: false,
        previousDisconnectTime: null
    };

    state.lastGps = { lat: null, lng: null, speed: null, updatedAt: null };

    const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`[TCP] New connection from ${clientAddress}`);

    socket.setTimeout(CONNECTION_TIMEOUT);
    socket.setKeepAlive(true, 30000);

    socket.on('data', async (incomingData) => {
        try {
            state.lastPacketAt = new Date();
            state.buffer = Buffer.concat([state.buffer, incomingData]);

            if (state.buffer.length > MAX_BUFFER_SIZE) {
                console.log(`[TCP] Buffer overflow from ${state.imei || clientAddress}`);
                state.buffer = Buffer.alloc(0);
                return socket.destroy();
            }

            await extractAndProcessPackets(socket, state);
        } catch (error) {
            console.error(`[TCP] Error (${state.imei || clientAddress}): ${error.message}`);
        }
    });

    socket.on('timeout', () => {
        console.log(`[TCP] Timeout: ${state.imei || clientAddress}`);
        socket.end();
    });

    socket.on('error', (error) => {
        console.error(`[TCP] Socket error (${state.imei || clientAddress}): ${error.message}`);
    });

    socket.on('close', async (hadError) => {
        await handleDisconnection(state, hadError);
    });
});

// ===========================================
// 4. PACKET EXTRACTION
// ===========================================
async function extractAndProcessPackets(socket, state) {
    let packetsProcessed = 0;
    let continueProcessing = true;

    while (continueProcessing && packetsProcessed < MAX_PACKETS_PER_BATCH) {
        const extractionResult = extractOnePacket(state.buffer);

        if (!extractionResult.found) {
            continueProcessing = false;
            if (state.buffer.length > 0) {
                console.log(`[TCP] Incomplete packet (${state.buffer.length} bytes), waiting...`);
            }
        } else {
            const { packet, remaining } = extractionResult;
            state.buffer = remaining;
            await processSinglePacket(socket, state, packet);
            packetsProcessed++;
            state.packetsReceived++;
        }
    }

    if (packetsProcessed > 1) {
        console.log(`[TCP] Batch processed ${packetsProcessed} packets from ${state.imei}`);
        state.batchPacketsReceived += packetsProcessed;
    }

    if (packetsProcessed >= MAX_PACKETS_PER_BATCH && state.buffer.length > 0) {
        setImmediate(() => extractAndProcessPackets(socket, state));
    }
}

function extractOnePacket(buffer) {
    if (buffer.length === 0) return { found: false, packet: null, remaining: buffer };

    const delimiterResult = extractByDelimiter(buffer, PROTOCOL.END_MARKER);
    if (delimiterResult.found) return delimiterResult;

    const lengthResult = extractByLength(buffer);
    if (lengthResult.found) return lengthResult;

    const markerResult = extractByMarkers(buffer, PROTOCOL.START_MARKER, PROTOCOL.END_MARKER);
    if (markerResult.found) return markerResult;

    return { found: false, packet: null, remaining: buffer };
}

function extractByDelimiter(buffer, delimiter) {
    const delimiterIndex = findBufferIndex(buffer, delimiter);
    if (delimiterIndex === -1) return { found: false, packet: null, remaining: buffer };

    const packetEnd = delimiterIndex + delimiter.length;
    return { found: true, packet: buffer.slice(0, packetEnd), remaining: buffer.slice(packetEnd) };
}

function extractByLength(buffer) {
    if (buffer.length < 2) return { found: false, packet: null, remaining: buffer };
    const packetLength = buffer.readUInt16BE(0);

    if (packetLength <= 0 || packetLength > MAX_BUFFER_SIZE) return { found: false, packet: null, remaining: buffer };

    const totalLength = 2 + packetLength; 
    if (buffer.length < totalLength) return { found: false, packet: null, remaining: buffer };

    return { found: true, packet: buffer.slice(0, totalLength), remaining: buffer.slice(totalLength) };
}

function extractByMarkers(buffer, startMarker, endMarker) {
    const startIndex = findBufferIndex(buffer, startMarker);
    if (startIndex === -1) return { found: false, packet: null, remaining: buffer };

    const searchFrom = startIndex + startMarker.length;
    const endIndex = findBufferIndex(buffer.slice(searchFrom), endMarker);
    if (endIndex === -1) return { found: false, packet: null, remaining: buffer };

    const packetEnd = searchFrom + endIndex + endMarker.length;
    return { found: true, packet: buffer.slice(startIndex, packetEnd), remaining: buffer.slice(packetEnd) };
}

function findBufferIndex(buffer, marker) {
    for (let i = 0; i <= buffer.length - marker.length; i++) {
        let found = true;
        for (let j = 0; j < marker.length; j++) {
            if (buffer[i + j] !== marker[j]) { found = false; break; }
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
            if (state.isAuthenticated) await handleGpsPacket(socket, state, packet);
            break;
    }
}

function identifyPacketType(packet) {
    const dataString = packet.toString('ascii').toLowerCase();
    if (dataString.includes('batch') || dataString.includes('bulk') || dataString.includes('history')) return PROTOCOL.TYPES.GPS_BATCH;
    if (dataString.includes('login') || dataString.includes('imei:')) return PROTOCOL.TYPES.LOGIN;
    if (dataString.includes('gps') || dataString.includes('tracker') || dataString.includes('location')) return PROTOCOL.TYPES.GPS;
    if (dataString.includes('heartbeat') || dataString.includes('ping')) return PROTOCOL.TYPES.HEARTBEAT;
    if (dataString.includes('alarm') || dataString.includes('sos') || dataString.includes('alert')) return PROTOCOL.TYPES.ALARM;

    if (packet.length >= 4 && packet[0] === 0x78 && packet[1] === 0x78) {
        const protocolNumber = packet[3];
        switch (protocolNumber) {
            case 0x01: return PROTOCOL.TYPES.LOGIN;
            case 0x12: return PROTOCOL.TYPES.GPS;
            case 0x13: return PROTOCOL.TYPES.HEARTBEAT;
            case 0x16: return PROTOCOL.TYPES.ALARM;
            case 0x14: return PROTOCOL.TYPES.GPS_BATCH; 
        }
    }
    return PROTOCOL.TYPES.UNKNOWN;
}

// ===========================================
// 6. LOGIN HANDLER (Postgres Update)
// ===========================================
async function handleLoginPacket(socket, state, packet) {
    try {
        const imei = parseImeiFromPacket(packet);

        if (!imei || !isValidIMEI(imei)) {
            console.log(`[TCP] Invalid IMEI format`);
            sendResponse(socket, 'NACK');
            return socket.end();
        }

        // 💡 MySQL query ? වෙනුවට $1 සහ [rows] වෙනුවට { rows } ලෙස සකසා ඇත.
        const { rows } = await db.query(
            `SELECT vehicle_id, user_id, is_active 
             FROM vehicles 
             WHERE imei_number = $1 AND is_deleted = false`,
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

        if (activeClients.has(imei)) {
            const oldClient = activeClients.get(imei);
            state.isReconnection = true;
            state.previousDisconnectTime = oldClient.lastPacketAt;
            oldClient.socket.destroy();
            activeClients.delete(imei);
        }

        // 💡 ? වෙනුවට $1 සහ [statusRows] වෙනුවට { rows: statusRows }
        const { rows: statusRows } = await db.query(
            `SELECT online, last_fix FROM vehicle_status WHERE vehicle_id = $1`,
            [vehicle.vehicle_id]
        );

        if (statusRows.length > 0 && !statusRows[0].online) {
            state.isReconnection = true;
            state.previousDisconnectTime = statusRows[0].last_fix;
        }

        state.isAuthenticated = true;
        state.imei = imei;
        state.vehicleId = vehicle.vehicle_id;
        state.userId = vehicle.user_id;

        activeClients.set(imei, { socket, state, vehicleId: vehicle.vehicle_id, userId: vehicle.user_id });

        await updateOnlineStatus(state.vehicleId, true);
        console.log(`[TCP] LOGIN successful: ${imei}`);
        sendResponse(socket, 'ACK');

    } catch (error) {
        console.error(`[TCP] Login error: ${error.message}`);
        sendResponse(socket, 'NACK');
        socket.end();
    }
}

// ===========================================
// 7. GPS DATA HANDLER
// ===========================================
async function handleGpsPacket(socket, state, packet) {
    if (!state.isAuthenticated) return;

    try {
        const gpsData = parseGpsData(packet, state.imei);
        if (!gpsData) return;

        const validation = validateGpsData(gpsData);
        if (!validation.isValid) return;

        const isHistorical = isHistoricalData(gpsData.timestamp);
        await storeGpsData(gpsData, state, isHistorical);

        if (gpsData) {
            state.lastGps = {
                lat: gpsData.latitude,
                lng: gpsData.longitude,
                speed: gpsData.speed,
                updatedAt: new Date()
            };
        }

        sendResponse(socket, 'ACK');
    } catch (error) {
        console.error(`[TCP] GPS error (${state.imei}): ${error.message}`);
    }
}

// ===========================================
// 8. GPS BATCH HANDLER
// ===========================================
async function handleGpsBatchPacket(socket, state, packet) {
    if (!state.isAuthenticated) return;

    try {
        const gpsRecords = parseGpsBatchData(packet, state.imei);
        if (!gpsRecords || gpsRecords.length === 0) return;

        for (const gpsData of gpsRecords) {
            const validation = validateGpsData(gpsData);
            if (validation.isValid) {
                const isHistorical = isHistoricalData(gpsData.timestamp);
                await storeGpsData(gpsData, state, isHistorical);
            }
        }
        sendResponse(socket, 'ACK');
    } catch (error) {
        console.error(`[TCP] Batch error (${state.imei}): ${error.message}`);
    }
}

function parseGpsBatchData(packet, imei) {
    try {
        const dataString = packet.toString('ascii');
        const records = [];

        if (dataString.trim().startsWith('[')) {
            try {
                const jsonData = JSON.parse(dataString);
                for (const item of jsonData) {
                    records.push({
                        imei,
                        latitude: parseFloat(item.lat || item.latitude),
                        longitude: parseFloat(item.lng || item.longitude),
                        speed: parseFloat(item.speed) || 0,
                        heading: parseFloat(item.heading) || 0,
                        ignition: item.ignition,
                        fuel: item.fuel,
                        timestamp: new Date(item.time || item.timestamp)
                    });
                }
                return records;
            } catch (e) {}
        }

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
        return records;
    } catch (error) {
        return [];
    }
}

function parseBinaryBatch(packet, imei) {
    const records = [];
    try {
        const RECORD_SIZE = 20;
        let offset = 4;
        while (offset + RECORD_SIZE <= packet.length - 2) {
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
            if (isValidCoordinates(record.latitude, record.longitude)) records.push(record);
            offset += RECORD_SIZE;
        }
    } catch (error) {}
    return records;
}

function parseBinaryTimestamp(buffer) {
    if (buffer.length < 6) return new Date();
    try {
        return new Date(2000 + buffer[0], buffer[1] - 1, buffer[2], buffer[3], buffer[4], buffer[5]);
    } catch { return new Date(); }
}

// ===========================================
// 9. HEARTBEAT HANDLER (Postgres Update)
// ===========================================
async function handleHeartbeatPacket(socket, state, packet) {
    if (!state.isAuthenticated) return;

    try {
        // 💡 ? වෙනුවට $1 සහ NOW() වෙනුවට CURRENT_TIMESTAMP දමා ඇත.
        await db.query(
            `UPDATE vehicle_status 
             SET online = true, updated_at = CURRENT_TIMESTAMP 
             WHERE vehicle_id = $1`,
            [state.vehicleId]
        );
        sendResponse(socket, 'ACK');
    } catch (error) {
        console.error(`[TCP] Heartbeat error (${state.imei}): ${error.message}`);
    }
}

// ===========================================
// 10. ALARM HANDLER
// ===========================================
async function handleAlarmPacket(socket, state, packet) {
  if (!state.isAuthenticated) return;

  const alarmType = parseAlarmType(packet);
  const lat = state.lastGps?.lat ?? null;
  const lng = state.lastGps?.lng ?? null;

  await processAlert(state.userId, state.vehicleId, alarmType, lat, lng);
  console.log(`[TCP] Alarm: ${state.imei} | ${alarmType} | Lat: ${lat} | Lng: ${lng}`);
  sendResponse(socket, "ACK");
}

// ===========================================
// 11. PARSING FUNCTIONS
// ===========================================
function parseImeiFromPacket(packet) {
    try {
        const dataString = packet.toString('ascii');
        const imeiMatch = dataString.match(/imei[:\s]*(\d{15})/i);
        if (imeiMatch) return imeiMatch[1];

        const digitMatch = dataString.match(/\d{15}/);
        if (digitMatch) return digitMatch[0];

        if (packet.length >= 12 && packet[0] === 0x78 && packet[1] === 0x78) {
            return packet.slice(4, 12).toString('hex');
        }
        return null;
    } catch (error) { return null; }
}

function parseGpsData(packet, imei) {
    try {
        const dataString = packet.toString('ascii');
        const parts = dataString.split(',');

        if (parts.length >= 6) {
            let latitude = 0, longitude = 0, speed = 0, heading = 0, timestamp = new Date();

            for (let i = 0; i < parts.length - 1; i++) {
                const value = parseFloat(parts[i]);
                const direction = parts[i + 1];

                if (!isNaN(value) && value > 100) {
                    if (direction === 'N' || direction === 'S') latitude = parseCoordinate(value, direction);
                    else if (direction === 'E' || direction === 'W') longitude = parseCoordinate(value, direction);
                }
                
                if (!isNaN(value) && value >= -90 && value <= 90 && latitude === 0) latitude = value;
                else if (!isNaN(value) && value >= -180 && value <= 180 && longitude === 0) longitude = value;
            }

            for (const part of parts) {
                const value = parseFloat(part);
                if (!isNaN(value) && value >= 0 && value <= 300) { speed = value; break; }
            }

            if (isValidCoordinates(latitude, longitude)) {
                return { imei, latitude, longitude, speed, heading, ignition: detectIgnition(dataString), fuel: parseFuel(dataString), timestamp };
            }
        }
        return null;
    } catch (error) { return null; }
}

function parseCoordinate(value, direction) {
    const degrees = Math.floor(value / 100);
    const minutes = value % 100;
    let decimal = degrees + (minutes / 60);
    if (direction === 'S' || direction === 'W') decimal = -decimal;
    return Math.round(decimal * 1000000) / 1000000;
}

function parseTimestamp(timeString) {
    if (!timeString) return new Date();
    try {
        const isoDate = new Date(timeString);
        if (!isNaN(isoDate.getTime())) return isoDate;

        if (timeString.length >= 12) {
            return new Date(2000 + parseInt(timeString.substring(0, 2)), parseInt(timeString.substring(2, 4)) - 1, parseInt(timeString.substring(4, 6)), parseInt(timeString.substring(6, 8)), parseInt(timeString.substring(8, 10)), parseInt(timeString.substring(10, 12)));
        }
        return new Date();
    } catch { return new Date(); }
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

function isHistoricalData(timestamp) {
    if (!timestamp || !(timestamp instanceof Date)) return false;
    return (new Date().getTime() - timestamp.getTime()) > 60000;
}

// ===========================================
// 12. DATA STORAGE (Postgres Upsert & Placeholders)
// ===========================================
async function storeGpsData(data, state, isHistorical = false) {
    const { latitude, longitude, speed, heading, ignition, fuel, timestamp } = data;
    const { vehicleId } = state;

    try {
        // 💡 ? වෙනුවට $1 සිට $9 placeholders දමා ඇත.
        await db.query(
            `INSERT INTO gps_logs 
             (vehicle_id, lat, lng, speed, heading, ignition_status, fuel, recorded_at, is_historical)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [vehicleId, latitude, longitude, speed || 0, heading || 0, ignition, fuel, timestamp, isHistorical]
        );

        if (!isHistorical) {
            // 🔥 Postgres Upsert Syntax (ON CONFLICT) සඳහා සම්පූර්ණයෙන්ම වෙනස් කර ඇත.
            // vehicle_id යන්න vehicle_status හි PRIMARY KEY හෝ UNIQUE විය යුතුය.
            await db.query(
                `INSERT INTO vehicle_status 
                 (vehicle_id, lat, lng, speed, heading, ignition_status, fuel, last_fix, online)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                 ON CONFLICT (vehicle_id) DO UPDATE SET 
                    lat = EXCLUDED.lat,
                    lng = EXCLUDED.lng,
                    speed = EXCLUDED.speed,
                    heading = EXCLUDED.heading,
                    ignition_status = EXCLUDED.ignition_status,
                    fuel = EXCLUDED.fuel,
                    last_fix = EXCLUDED.last_fix,
                    online = true,
                    updated_at = CURRENT_TIMESTAMP`,
                [vehicleId, latitude, longitude, speed || 0, heading || 0, ignition, fuel, timestamp]
            );

            await checkAlerts(data, state);
            emitLiveUpdate(vehicleId, data);
        }
    } catch (error) {
        console.error('[TCP] Store GPS error:', error.message);
        throw error;
    }
}

// ===========================================
// 13. ALERTS (Postgres Update)
// ===========================================
async function checkAlerts(data, state) {
    const { speed } = data;
    const { vehicleId, userId, imei } = state;

    try {
        const SPEED_LIMIT = 120;
        if (speed && speed > SPEED_LIMIT) {
            // 💡 ? වෙනුවට $1, $2, $3 සහ NOW() වෙනුවට CURRENT_TIMESTAMP
            await db.query(
                `INSERT INTO alerts (vehicle_id, user_id, alert_type, message, created_at)
                 VALUES ($1, $2, 'OVERSPEED', $3, CURRENT_TIMESTAMP)`,
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
        if (type === 'ACK') socket.write(PROTOCOL.ACK);
        else socket.write(PROTOCOL.NACK);
    } catch (error) {
        console.error('[TCP] Send response error:', error.message);
    }
}

async function updateOnlineStatus(vehicleId, isOnline) {
    try {
        // 💡 ? වෙනුවට $1, $2 සහ NOW() වෙනුවට CURRENT_TIMESTAMP
        await db.query(
            `UPDATE vehicle_status 
             SET online = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE vehicle_id = $2`,
            [isOnline, vehicleId]
        );
    } catch (error) {
        console.error('[TCP] Update online status error:', error.message);
    }
}

// ===========================================
// 15. DISCONNECTION HANDLER (Postgres Update)
// ===========================================
async function handleDisconnection(state, hadError) {
    const duration = Math.round((Date.now() - state.connectedAt.getTime()) / 1000 / 60);

    if (state.imei) {
        console.log(`[TCP] Disconnected: ${state.imei}`);
        await updateOnlineStatus(state.vehicleId, false);

        // 💡 ? වෙනුවට $1 සහ NOW() වෙනුවට CURRENT_TIMESTAMP
        await db.query(
            `UPDATE vehicle_status 
             SET online = false, last_disconnect = CURRENT_TIMESTAMP 
             WHERE vehicle_id = $1`,
            [state.vehicleId]
        );

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
        activeClients.forEach((client) => { client.socket.destroy(); });
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
    return { activeConnections: activeClients.size, clients: getActiveClients() };
}

module.exports = {
    startTrackerServer,
    stopTrackerServer,
    getActiveClients,
    getStats,
    activeClients
};