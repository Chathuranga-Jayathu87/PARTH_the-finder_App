// import { getAuthToken } from "./authService";

// const BASE_URL = "https://parth-the-finder-app.onrender.com/api/users";

// // -------------------------------------------------------------
// // 📐 TYPES & INTERFACES
// // -------------------------------------------------------------
// export interface ProfileResponse {
//   success: boolean;
//   user?: {
//     id: string;
//     name: string;
//     email: string;
//     phone: string;
//     profile_image?: string;
//   };
//   message?: string;
// }

// export interface NotificationSettings {
//   [key: string]: number | boolean | string | undefined;
  
// }

// export interface CommonResponse {
//   success: boolean;
//   message?: string;
// }

// // -------------------------------------------------------------
// // 👤 UPDATE PROFILE (WITH IMAGE UPLOAD)
// // -------------------------------------------------------------
// export const updateProfile = async (
//   name: string,
//   phone: string,
//   imageUri?: string | null
// ): Promise<ProfileResponse> => {
//   try {
//     const authToken = await getAuthToken();
//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("phone", phone);

    
//     if (imageUri && imageUri.startsWith("file://")) {
//       const filename = imageUri.split("/").pop();
//       const match = /\.(\w+)$/.exec(filename || "");
//       const type = match ? `image/${match[1]}` : `image/jpeg`;

      
//       formData.append("profile_image", {
//         uri: imageUri,
//         name: filename || "profile.jpg",
//         type: type,
//       } as any);
//     }

//     const response = await fetch(`${BASE_URL}/update-profile`, {
//       method: "PUT",
//       body: formData,
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "multipart/form-data",
//         Authorization: `Bearer ${authToken}`,
//       },
//     });

//     return await response.json();
//   } catch (error) {
//     console.error("User Service Error:", error);
//     throw error;
//   }
// };

// // -------------------------------------------------------------
// // 🔍 GET PROFILE
// // -------------------------------------------------------------
// export const getProfile = async (): Promise<ProfileResponse> => {
//   try {
//     const token = await getAuthToken();
//     const response = await fetch(`${BASE_URL}/profile`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Fetch Profile Error:", error);
//     throw error;
//   }
// };

// // -------------------------------------------------------------
// // 🔒 CHANGE PASSWORD
// // -------------------------------------------------------------
// export const changePassword = async (
//   oldPassword: string,
//   newPassword: string
// ): Promise<CommonResponse> => {
//   try {

//     const token = await getAuthToken();
//     const response = await fetch(`${BASE_URL}/change-password`, {
//       method: "PUT",
//       body: JSON.stringify({ oldPassword, newPassword }),
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Change Password Error:", error);
//     throw error;
//   }
// };

// // -------------------------------------------------------------
// // 🔔 GET NOTIFICATION SETTINGS
// // -------------------------------------------------------------
// export const getNotificationSettings = async (): Promise<NotificationSettings> => {
//   const token = await getAuthToken();

//   const response = await fetch(`${BASE_URL}/settings/notifications`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       Accept: "application/json",
//     },
//   });

//   const text = await response.text();
//   console.log("Raw response:", response.status, text);

//   let data: any;
//   try {
//     data = JSON.parse(text);
//   } catch {
//     throw new Error("Invalid JSON response");
//   }

//   if (!response.ok) {
//     throw new Error(data?.message || "Request failed");
//   }

//   return data;
// };

// // -------------------------------------------------------------
// // ⚙️ UPDATE NOTIFICATION SETTING
// // -------------------------------------------------------------
// export const updateNotificationSetting = async (
//   key: string,
//   value: boolean | number
// ): Promise<CommonResponse> => {
//   try {
//     const token = await getAuthToken();
//     const response = await fetch(`${BASE_URL}/settings/notifications`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ key, value: value ? 1 : 0 }),
//     });
//     return await response.json();
//   } catch (error) {
//     console.error("Update Notification Setting Error:", error);
//     throw error;
//   }
// };


import { getAuthToken } from "./authService";

const BASE_URL = "https://parth-the-finder-app.onrender.com/api/users";

// -------------------------------------------------------------
// 📐 TYPES & INTERFACES
// -------------------------------------------------------------
export interface ProfileResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile_image?: string;
  };
  message?: string;
}

export interface NotificationSettings {
  [key: string]: number | boolean | string | undefined;
}

export interface CommonResponse {
  success: boolean;
  message?: string;
}

// -------------------------------------------------------------
// 👤 UPDATE PROFILE (WITH IMAGE UPLOAD)
// -------------------------------------------------------------
export const updateProfile = async (
  name: string,
  phone: string,
  imageUri?: string | null
): Promise<ProfileResponse> => {
  try {
    const authToken = await getAuthToken();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);

    /* 
       💡 FIXED IMAGE CHECK:
       Instead of strictly checking for "file://", we check if the imageUri exists 
       and make sure it isn't an online web URL (like our Cloudinary links starting with http).
    */
    if (imageUri && !imageUri.startsWith("http")) {
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("profile_image", {
        uri: imageUri,
        name: filename || "profile.jpg",
        type: type,
      } as any);
    }

    const response = await fetch(`${BASE_URL}/update-profile`, {
      method: "PUT",
      body: formData,
      headers: {
        Accept: "application/json",
        /* 
           💡 CRITICAL CHANGE: 
           Removed "Content-Type": "multipart/form-data" manually.
           Leaving this out forces fetch to auto-generate the correct header + multipart boundary tags!
        */
        Authorization: `Bearer ${authToken}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error("User Service Error:", error);
    throw error;
  }
};

// -------------------------------------------------------------
// 🔍 GET PROFILE
// -------------------------------------------------------------
export const getProfile = async (): Promise<ProfileResponse> => {
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

// -------------------------------------------------------------
// 🔒 CHANGE PASSWORD
// -------------------------------------------------------------
export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<CommonResponse> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Change Password Error:", error);
    throw error;
  }
};

// -------------------------------------------------------------
// 🔔 GET NOTIFICATION SETTINGS
// -------------------------------------------------------------
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const token = await getAuthToken();

  const response = await fetch(`${BASE_URL}/settings/notifications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  console.log("Raw response:", response.status, text);

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

// -------------------------------------------------------------
// ⚙️ UPDATE NOTIFICATION SETTING
// -------------------------------------------------------------
export const updateNotificationSetting = async (
  key: string,
  value: boolean | number
): Promise<CommonResponse> => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/settings/notifications`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key, value: value ? 1 : 0 }),
    });
    return await response.json();
  } catch (error) {
    console.error("Update Notification Setting Error:", error);
    throw error;
  }
};