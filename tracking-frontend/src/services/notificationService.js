const BASE_URL = "http://169.254.16.170:5000/api/users";

export const saveExpoPushToken = async (token, jwt) => {
  console.log("💾 Saving Expo Push Token to backend:", token);
  console.log("💾 Using JWT:", jwt);
  await fetch(`${BASE_URL}/save-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`, // if you have auth
    },
    body: JSON.stringify({
      expoPushToken: token,
    }),
  });
};
