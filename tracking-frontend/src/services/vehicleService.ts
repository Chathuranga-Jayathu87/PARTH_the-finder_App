import { getAuthToken } from "./authService";


const API_BASE_URL = "http://10.168.231.90:5000/api/vehicles";

// -------------------------------------------------------------
// 📐 TYPES & INTERFACES
// -------------------------------------------------------------
export interface VehicleData {
  name: string;
  vehicleNumber: string;
  type: string;
  
  [key: string]: any; 
}

export interface VehicleResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// -------------------------------------------------------------
// 🚗 REGISTER VEHICLE
// -------------------------------------------------------------
export const registerVehicle = async (vehicleData: VehicleData): Promise<any> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicleData),
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error occurred");
      } else {
        const errorText = await response.text();
        console.error("Server returned HTML instead of JSON:", errorText);
        throw new Error("Server crashed or route not found (404)");
      }
    }

    return await response.json();
  } catch (error: any) {
    console.error("Network or App Error:", error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// 🔍 GET VEHICLE BY ID
// -------------------------------------------------------------
export const getVehicleById = async (id: string | number): Promise<any> => {
  try {
    const token = await getAuthToken();

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error occurred");
      } else {
        const errorText = await response.text();
        console.error("❌ Non-JSON response:", errorText);
        throw new Error("Server error or route not found");
      }
    }

    return await response.json();
  } catch (error: any) {
    console.error("❌ getVehicleById failed:", error.message);
    throw error; 
  }
};