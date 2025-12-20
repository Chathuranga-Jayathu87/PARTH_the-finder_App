const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth.middleware');
const  vehicleController = require('../controllers/vehicle.controller');

//Apply the middleware to all routes in this router.
//This means that all vehicle routes will require authentication.
router.use(authMiddleware);


//1.Validation Helper Function

//Validate IMEI number (must be 15 digits)

const isValidIMEI = (imei) => {
    if (!imei || typeof imei !== 'string'){
        return false;
    }
    const imeiRegex = /^\d{15}$/;
    return imeiRegex.test(imei);
};

const isValidLicensePlate = (plate) => {
    if (!plate || typeof plate !== 'string'){
        return false;
    }

    const plateRegex = /^[A-Za-z0-9]{2,10}$/; //Example: Alphanumeric, 2-10 characters
    return plateRegex.test(plate.replace(/[-\s]/g, ''));
};

const isValidSIMNumber = (sim) => {
    if (!sim) return true; //SIM number is optional
    const simRegex = /^\d{10,15}$/; //Example: 10-15 digits
    return simRegex.test(sim);
};

const isValidMakeModel = (makeModel) => {
    if (!makeModel) return true; //Make/Model is optional
    return typeof makeModel === 'string' && makeModel.length <= 100;
}

// Complete validation function
const validateVehicleData = (data) => {
    const errors = [];

    //IMEI validation
    if(!data.imei_number) {
        errors.push('IMEI number is required.');    
    }else if (!isValidIMEI(data.imei_number)){
        errors.push('IMEI number must be a 15-digit numeric string.');
    }

    //Lisense plate validation
    if (!data.license_plate){
        errors.push('License plate is required.');
    }else if (!isValidLicensePlate(data.license_plate)){
        errors.push('License plate format is invalid.');
    }

    //SIM number validation
    if(data.sim_number && !isValidSIMNumber(data.sim_number)){
        errors.push('SIM number format is invalid.');
    }
    //Make/Model validation
    if(data.make_model && !isValidMakeModel(data.make_model)){
        errors.push('Make/Model must be a string with a maximum length of 100 characters.');
    }

    return{
    isValid: errors.length === 0,
    errors: errors
    };
};


//post /api/vehicles/register
//Register a new vehicle and link it to an IMEI for tracking
router.post('/register', async(req, res) => {
    const user_id = req.user.user_id; //Get user ID from the authenticated user
    const { license_plate, imei_number, make_model, sim_number} = req.body; 
    
//Validation Inputs
    const validation = validateVehicleData({ imei_number, license_plate, make_model, sim_number });

    if(!validation.isValid){
        return res.status(400).json({error: validation.errors[0],errors: validation.errors});
    }

try {
    // ✅ Safely normalize by converting to String first to avoid .trim() crashes
    const normalizedPlate = String(license_plate || '').toUpperCase().trim();
    const normalizedIMEI = String(imei_number || '').trim();
    const normalizedMakeModel = make_model ? String(make_model).trim() : null;
    
    // Check if it's a number/string, then stringify it before trimming
    const normalizedSIM = sim_number ? String(sim_number).trim() : null;

    // 1. check if IMEI already exists
    const [existingIMEI] = await db.query(
        'SELECT vehicle_id FROM vehicles WHERE imei_number = ?',
        [normalizedIMEI]
    );

    if (existingIMEI.length > 0) {
        return res.status(409).json({ error: 'This IMEI number is already registered.' });
    }

    // 2. Insert new vehicle
    const insertQuery = `
        INSERT INTO vehicles (user_id, imei_number, license_plate, make_model, sim_number, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(insertQuery, [
        user_id, 
        normalizedIMEI, 
        normalizedPlate, 
        normalizedMakeModel, 
        normalizedSIM
    ]);

    res.status(201).json({
        message: 'Vehicle registered successfully.',
        vehicle_id: result.insertId,
        data: {
            license_plate: normalizedPlate,
            imei_number: normalizedIMEI,
            make_model: normalizedMakeModel,
            sim_number: normalizedSIM
        }
    });




}catch (error){
    if(error.code === 'ER_DUP_ENTRY'){
        return res.status(409).json({error: 'IMEI or License plate is Allready registered.'});
    }

    console.error('Error registering vehicle:', error.message);
    res.status(500).json({error: 'Failed to Register Vehicle due to an internal error. Please try again later.'})

}
    
});
//get the vehicle information to the header of the each vehicle and also history
router.get("/:id",vehicleController.getVehicleById);

module.exports = router;