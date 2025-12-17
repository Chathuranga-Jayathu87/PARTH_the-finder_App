// src/services/dataService.js

import { getAuthToken } from './authService'; // Use the function we just created
// const API_BASE_URL = 'http://172.20.10.3:5000/api/data'; 
const API_BASE_URL = 'http://172.20.10.3:5000/api/v1'; // Assuming a common data API base

// --- Helper function to prepare authenticated fetch headers ---
const getSecuredHeaders = async () => {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // The crucial JWT bearer token
    };
};

// 🚀 1. Fetch all vehicles registered to the currently logged-in user
export const getRegisteredVehicles = async () => {
    try {
        const headers = await getSecuredHeaders();
        
        // This endpoint will query the 'vehicles' table WHERE user_id = LOGGED_IN_USER_ID
        const response = await fetch(`${API_BASE_URL}/vehicles`, {
            method: 'GET',
            headers: headers,
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle specific errors like token expired (401) or resource not found
            throw new Error(data.message || 'Failed to fetch vehicles.');
        }

        // Expected return: [{ id, plate, model, ... }, ...]
        return data.vehicles || []; 

    } catch (error) {
        console.error('Error fetching vehicles:', error.message);
        throw error;
    }
};

// 🚀 2. Fetch Alerts (Placeholder for future use)
export const getAlerts = async (page = 1) => {
    // ... logic to fetch from /api/v1/alerts ...
};