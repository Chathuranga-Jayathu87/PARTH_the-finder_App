import { getAuthToken } from "./authService";

const API_BASE_URL = "http://10.168.231.90:5000/api/v1";

// -------------------------------------------------------------
// 📐 TYPES & INTERFACES
// -------------------------------------------------------------
export interface Vehicle {
  id: string | number;
  plate?: string;
  model?: string;
  type?: string;
  [key: string]: any;
}

export interface Alert {
  id: string | number;
  title?: string;
  message?: string;
  isRead: boolean | number;
  createdAt?: string;
  [key: string]: any;
}

interface SecuredHeaders {
  "Content-Type": string;
  Authorization: string;
  [key: string]: string;
}

// -------------------------------------------------------------
// 🔑 SECURED HEADERS HELPER
// -------------------------------------------------------------
const getSecuredHeaders = async (): Promise<SecuredHeaders> => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// -------------------------------------------------------------
// 🚗 FETCH REGISTERED VEHICLES
// -------------------------------------------------------------
export const getRegisteredVehicles = async (): Promise<Vehicle[]> => {
  try {
    const headers = await getSecuredHeaders();
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json();
    

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch vehicles.");
    }
    if (Array.isArray(data)) return data;
    return data.vehicles || [];
  } catch (error: any) {
    console.error("Error fetching vehicles:", error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// 🔔 FETCH HISTORICAL ALERTS
// -------------------------------------------------------------
export const getAlerts = async (): Promise<Alert[]> => {
  try {
    const headers = await getSecuredHeaders();
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json();
    console.log("Alerts Fetch Status:", response.status);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch alerts.");
    }
    if (Array.isArray(data)) return data;
    return data.alerts || [];
  } catch (error: any) {
    console.error("Error fetching alerts:", error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// 🔄 MARK ALERT AS READ
// -------------------------------------------------------------
export const markAsRead = async (alertId: string | number): Promise<any> => {
  try {
    const headers = await getSecuredHeaders();

    const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
      method: "PUT",
      headers: headers,
    });

    const data = await response.json();
    console.log("Mark Read Status:", response.status);

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark alert as read.");
    }

    return data;
  } catch (error: any) {
    console.error("Error marking alert as read:", error.message);
    throw error;
  }
};