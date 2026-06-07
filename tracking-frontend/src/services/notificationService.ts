
const BASE_URL = "https://parth-the-finder-app.onrender.com/api/users";

export const saveExpoPushToken = async (token: string, jwt: string): Promise<void> => {
 // console.log("💾 Saving Expo Push Token to backend:", token);
  //console.log("💾 Using JWT:", jwt);

  try {
    const response = await fetch(`${BASE_URL}/save-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        expoPushToken: token,
      }),
    });

  
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to save push token:", response.status, errorText);
    } else {
      console.log("✅ Push token saved successfully!");
    }
    
  } catch (error: any) {
  
    console.error("❌ Error inside saveExpoPushToken:", error.message);
  }
};