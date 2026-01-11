// src/services/dataService.js

import { getAuthToken } from "./authService"; // Use the function we just created
// const API_BASE_URL = 'http://172.20.10.3:5000/api/data';
const API_BASE_URL = "http://172.20.10.3:5000/api/v1"; // Assuming a common data API base

// --- Helper function to prepare authenticated fetch headers ---
const getSecuredHeaders = async () => {
  const token = await getAuthToken();
  //console.log(token);
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // The crucial JWT bearer token
  };
};

// 🚀 1. Fetch all vehicles registered to the currently logged-in user
export const getRegisteredVehicles = async () => {
  try {
    const headers = await getSecuredHeaders();
    console.log(headers);
    // This endpoint will query the 'vehicles' table WHERE user_id = LOGGED_IN_USER_ID
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      //http://172.20.10.3:5000/api/v1/vehicles
      method: "GET",
      headers: headers,
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log(data);

    if (!response.ok) {
      // Handle specific errors like token expired (401) or resource not found
      throw new Error(data.message || "Failed to fetch vehicles.");
    }

    // Expected return: [{ id, plate, model, ... }, ...]
    return data.vehicles || [];
  } catch (error) {
    console.error("Error fetching vehicles:", error.message);
    throw error;
  }
};

// 🚀 2. Fetch Alerts (Placeholder for future use)
// 🚀 Fetch historical alerts for the logged-in user
export const getAlerts = async () => {
  try {
    const headers = await getSecuredHeaders();
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch alerts.");
    }

    // Returns an array of alerts
    return data.alerts || [];
  } catch (error) {
    console.error("Error fetching alerts:", error.message);
    throw error;
  }
};

export const markAsRead = async (alertId) => {
  try {
    const headers = await getSecuredHeaders();

    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
      method: "PUT",
      headers: headers,
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark alert as read.");
    }

    return data;
  } catch (error) {
    console.error("Error marking alert as read:", error.message);
    throw error;
  }
};
