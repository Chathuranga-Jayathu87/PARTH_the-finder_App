// src/services/userService.js
import { getAuthToken } from "./authService";

const BASE_URL = "http://172.20.10.3:5000/api/users";

export const updateProfile = async (name, email, phone, imageUri) => {
  try {
    const authToken = await getAuthToken();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);

    // Only attach if there is a new local image selected
    if (imageUri && imageUri.startsWith("file://")) {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("profile_image", {
        uri: imageUri,
        name: filename,
        type: type,
      });
    }

    const response = await fetch(`${BASE_URL}/update-profile`, {
      method: "PUT",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error("User Service Error:", error);
    throw error;
  }
};

// src/services/userService.js

export const getProfile = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    throw error;
  }
};

/**
 * Change Password Service
 */
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};
