// // D:\Project\Tracker_app\gps-mobile-app\src\services\authService.js

// // IMPORTANT: Replace this with the IP address of the machine running your Node.js server.
// // If you are running both the mobile app and the server on the same physical machine, 
// // 'http://10.0.2.2' is the correct address for the Android emulator to reach your local host.
// // For iOS Simulator, use 'http://localhost' or 'http://127.0.0.1'.
// //const API_BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Adjust if needed

// const API_BASE_URL = 'http://172.20.10.3:5000/api/auth'; // Adjust if needed

// export const login = async (email, password) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/login`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ email, password }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             // Handle HTTP errors (e.g., 401 Unauthorized, 400 Bad Request)
//             throw new Error(data.message || 'Login failed due to server error.');
//         }

//         // Expected success response: { token: '...', user: {...} }
//         return data; 

//     } catch (error) {
//         console.error('Error during login:', error.message);
//         console.log('API_BASE_URL:', API_BASE_URL);
//         throw error;
//     }
// };

// // Register function 
// export const register = async (name, email, password, phone) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/register`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ name, email, password, phone }),
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             throw new Error(data.message || 'Registration failed due to server error.');
//         }

//         return data;

//     } catch (error) {
//         console.error('Error during registration:', error.message);
//         throw error;
//     }
// };




// D:\Project\Tracker_app\gps-mobile-app\src\services\authService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: Verify this URL matches your Node.js server's IP and port.
// const API_BASE_URL = 'http://172.20.10.3:5000/api/auth'; 
const API_BASE_URL = 'http://172.20.10.3:5000/api/auth'; // Using your provided URL
const TOKEN_KEY = 'authToken'; // Key for AsyncStorage

// -------------------------------------------------------------
// 🚀 STORAGE UTILITIES (REQUIRED FOR AUTHENTICATION)
// -------------------------------------------------------------

// Saves the JWT token to local storage after a successful login/register
export const saveAuthToken = async (token) => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('AsyncStorage Error: Could not save token', error);
    }
};

// Retrieves the token for use in secured API calls
export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('AsyncStorage Error: Could not get token', error);
        return null;
    }
};

// Clears the token on logout
export const clearAuthToken = async () => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('AsyncStorage Error: Could not clear token', error);
    }
};

// -------------------------------------------------------------
// 🔑 LOGIN FUNCTION (MODIFIED TO SAVE TOKEN)
// -------------------------------------------------------------
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {  //http://172.20.10.3:5000/api/auth/login
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed due to server error.');
        }

        // 🚀 CRITICAL STEP: Save the JWT token received from the backend
        if (data.token) {
            await saveAuthToken(data.token);
        } else {
            throw new Error('Authentication token missing from server response.');
        }

        // Returns the user data/success message
        return data; 

    } catch (error) {
        console.error('Error during login:', error.message);
        throw error;
    }
};

// -------------------------------------------------------------
// 📝 REGISTER FUNCTION (MODIFIED TO LOG IN/SAVE TOKEN AFTER REGISTRATION)
// -------------------------------------------------------------
export const register = async (name, email, password, phone) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {  //http://172.20.10.3:5000/api/auth/register
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, phone }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed due to server error.');
        }
        
       

        return data;

    } catch (error) {
        console.error('Error during registration:', error.message);
        throw error;
    }
};