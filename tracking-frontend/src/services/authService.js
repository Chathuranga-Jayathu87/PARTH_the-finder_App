// D:\Project\Tracker_app\gps-mobile-app\src\services\authService.js

// IMPORTANT: Replace this with the IP address of the machine running your Node.js server.
// If you are running both the mobile app and the server on the same physical machine, 
// 'http://10.0.2.2' is the correct address for the Android emulator to reach your local host.
// For iOS Simulator, use 'http://localhost' or 'http://127.0.0.1'.
//const API_BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Adjust if needed

const API_BASE_URL = 'http:// 172.20.10.3:5000/api/auth'; // Adjust if needed

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle HTTP errors (e.g., 401 Unauthorized, 400 Bad Request)
            throw new Error(data.message || 'Login failed due to server error.');
        }

        // Expected success response: { token: '...', user: {...} }
        return data; 

    } catch (error) {
        console.error('Error during login:', error.message);
        throw error;
    }
};

// Register function 
export const register = async (name, email, password, phone) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
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