import { getAuthToken } from "./authService";

const API_BASE_URL = "http://169.254.16.170:5000/api/vehicles"; // Use your specific API base

// export const registerVehicle = async (vehicleData) => {
//     try {
//         const token = await getAuthToken();
//         console.log(token);
//         console.log(vehicleData);
//         const response = await fetch(`${API_BASE_URL}/vehicles/register`, {   //http://169.254.16.170:5000/api/vehicles/register
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify(vehicleData),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(data.message || 'Failed to register vehicle');
//         }

//         return data;
//     } catch (error) {
//         console.error('Vehicle Registration Error:', error.message);
//         throw error;
//     }
// };

export const registerVehicle = async (vehicleData) => {
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

    // 1. Check if the response is actually JSON before parsing
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      // If the server sent an error, try to get the JSON error message
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error occurred");
      } else {
        // If the server sent HTML (the "<" error), get the text instead
        const errorText = await response.text();
        console.error("Server returned HTML instead of JSON:", errorText);
        throw new Error("Server crashed or route not found (404)");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Network or App Error:", error.message);
    throw error;
  }
};

// export const getVehicleHeder = async (id) => {
//     try{
//         const token = await getAuthToken();
//         const response = await fetch(`${API_BASE_URL}/${id}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify(),
//         });

//  // 1. Check if the response is actually JSON before parsing
//         const contentType = response.headers.get("content-type");

//     if (!response.ok) {
//             // If the server sent an error, try to get the JSON error message
//             if (contentType && contentType.indexOf("application/json") !== -1) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'Server error occurred');
//             } else {
//                 // If the server sent HTML (the "<" error), get the text instead
//                 const errorText = await response.text();
//                 console.error("Server returned HTML instead of JSON:", errorText);
//                 throw new Error('Server crashed or route not found (404)');
//             }
//         }

//         return await response.json();

//     }catch(error){
//         console.error("Network or App Error:", error.message);
//     }
// };

export const getVehicleById = async (id) => {
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
  } catch (error) {
    console.error("❌ getVehicleById failed:", error.message);
    throw error; // IMPORTANT: rethrow so UI can react
  }
};
