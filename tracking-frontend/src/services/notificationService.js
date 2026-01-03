const BASE_URL = "http://172.20.10.3:5000/api/users";

export const saveExpoPushToken = async (token, userId, jwt) => {
  await fetch(`${BASE_URL}/save-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`, // if you have auth
    },
    body: JSON.stringify({
      userId,
      expoPushToken: token,
    }),
  });
};
