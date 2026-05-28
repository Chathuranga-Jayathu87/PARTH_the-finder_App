const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ඔයාගේ නිවැරදි db.js path එක දාන්න
const authMiddleware = require('../middleware/auth.middleware');
const vehicleController = require('../controllers/vehicle.controller');

// Apply the middleware to all routes in this router.
router.use(authMiddleware);

// 1. Validation Helper Functions
const isValidIMEI = (imei) => {
    if (!imei || typeof imei !== 'string') {
        return false;
    }
    const imeiRegex = /^\d{15}$/;
    return imeiRegex.test(imei);
};

const isValidLicensePlate = (plate) => {
    if (!plate || typeof plate !== 'string') {
        return false;
    }
    const plateRegex = /^[A-Za-z0-9]{2,10}$/;
    return plateRegex.test(plate.replace(/[-\s]/g, ''));
};

const isValidSIMNumber = (sim) => {
    if (!sim) return true;
    const simRegex = /^\d{10,15}$/;
    return simRegex.test(sim);
};

const isValidMakeModel = (makeModel) => {
    if (!makeModel) return true;
    return typeof makeModel === 'string' && makeModel.length <= 100;
};

// Complete validation function
const validateVehicleData = (data) => {
    const errors = [];

    if (!data.imei_number) {
        errors.push('IMEI number is required.');    
    } else if (!isValidIMEI(data.imei_number)) {
        errors.push('IMEI number must be a 15-digit numeric string.');
    }

    if (!data.license_plate) {
        errors.push('License plate is required.');
    } else if (!isValidLicensePlate(data.license_plate)) {
        errors.push('License plate format is invalid.');
    }

    if (data.sim_number && !isValidSIMNumber(data.sim_number)) {
        errors.push('SIM number format is invalid.');
    }
    
    if (data.make_model && !isValidMakeModel(data.make_model)) {
        errors.push('Make/Model must be a string with a maximum length of 100 characters.');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// POST /api/vehicles/register
router.post('/register', async (req, res) => {
    const user_id = req.user.user_id;
    const { license_plate, imei_number, make_model, sim_number } = req.body; 
    
    // Validation Inputs
    const validation = validateVehicleData({ imei_number, license_plate, make_model, sim_number });

    if (!validation.isValid) {
        return res.status(400).json({ error: validation.errors[0], errors: validation.errors });
    }

    try {
        const normalizedPlate = String(license_plate || '').toUpperCase().trim();
        const normalizedIMEI = String(imei_number || '').trim();
        const normalizedMakeModel = make_model ? String(make_model).trim() : null;
        const normalizedSIM = sim_number ? String(sim_number).trim() : null;

        // 1. Check if IMEI already exists (? වෙනුවට $1 සහ { rows } destructuring)
        const checkQuery = 'SELECT vehicle_id FROM vehicles WHERE imei_number = $1';
        const { rows: existingIMEI } = await db.query(checkQuery, [normalizedIMEI]);

        if (existingIMEI.length > 0) {
            return res.status(409).json({ error: 'This IMEI number is already registered.' });
        }

        // 2. Insert new vehicle
        // 🔥 Postgres වල auto-increment ID එක ගන්න අන්තිමට RETURNING vehicle_id එකතු කර ඇත.
        const insertQuery = `
            INSERT INTO vehicles (user_id, imei_number, license_plate, make_model, sim_number, created_at)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            RETURNING vehicle_id
        `;

        const { rows: insertResult } = await db.query(insertQuery, [
            user_id, 
            normalizedIMEI, 
            normalizedPlate, 
            normalizedMakeModel, 
            normalizedSIM
        ]);

        // RETURNING හරහා ආපු අලුත් ID එක ලබා ගැනීම
        const newVehicleId = insertResult[0].vehicle_id;

        res.status(201).json({
            message: 'Vehicle registered successfully.',
            vehicle_id: newVehicleId,
            data: {
                license_plate: normalizedPlate,
                imei_number: normalizedIMEI,
                make_model: normalizedMakeModel,
                sim_number: normalizedSIM
            }
        });

    } catch (error) {
        // Postgres unique constraint key violation error code 23505
        if (error.code === '23505') {
            return res.status(409).json({ error: 'IMEI or License plate is already registered.' });
        }

        console.error('Error registering vehicle:', error.message);
        res.status(500).json({ error: 'Failed to Register Vehicle due to an internal error. Please try again later.' });
    }
});

// Get the vehicle information
router.get("/:id", vehicleController.getVehicleById);

module.exports = router;