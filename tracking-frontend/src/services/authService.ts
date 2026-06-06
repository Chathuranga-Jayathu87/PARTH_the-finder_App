import AsyncStorage from "@react-native-async-storage/async-storage";


const API_BASE_URL = "http://10.168.231.90:5000/api/auth"; 
const TOKEN_KEY = "authToken";

// -------------------------------------------------------------
// 📐 TYPES & INTERFACES
// -------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
  success?: boolean;
}

// -------------------------------------------------------------
// 🚀 STORAGE UTILITIES
// -------------------------------------------------------------

// Token save to local storage
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    console.log("Saving Auth Token:", token);
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("AsyncStorage Error: Could not save token", error);
  }
};

// Token get from local storage
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log("Retrieved Auth Token vgvvyyv:", token);
    return token;
  } catch (error) {
    console.error("AsyncStorage Error: Could not get token", error);
    return null;
  }
};

// Token clearing function
export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("AsyncStorage Error: Could not clear token", error);
  }
};

// -------------------------------------------------------------
// 🔑 LOGIN FUNCTION
// -------------------------------------------------------------
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed due to server error.");
    }

    // Save token if present
    if (data.token) {
      await saveAuthToken(data.token);
    } else {
      throw new Error("Authentication token missing from server response.");
    }

    return data;
  } catch (error: any) {
    console.error("Error during login:", error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// 📝 REGISTER FUNCTION
// -------------------------------------------------------------
export const register = async (
  name: string,
  email: string,
  password: string,
  phone: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, phone }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed due to server error.");
    }

    return data;
  } catch (error: any) {
    console.error("Error during registration:", error.message);
    throw error;
  }
};

// -------------------------------------------------------------
// 🔒 PASSWORD RESET FUNCTION
// -------------------------------------------------------------
export const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error: any) {
    console.error("Error during password reset:", error.message);
    throw error;
  }
};

// 🔒 COMPLETE PASSWORD RESET WITH TOKEN
export const completePasswordReset = async (token: string, password: string): Promise<AuthResponse> => {
  try {
    // Still Not Developed in Backend, but this is how it would look like
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to reset password. Link may be expired.");
    }

    return data;
  } catch (error: any) {
    console.error("Error during password reset completion:", error.message);
    throw error;
  }
};