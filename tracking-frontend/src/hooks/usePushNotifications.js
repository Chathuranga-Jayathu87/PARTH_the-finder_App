// import { useEffect } from "react";
// import * as Notifications from "expo-notifications";
// import { Platform } from "react-native";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// export async function registerForPushNotificationsAsync() {
//   let token;

//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;

//   if (existingStatus !== "granted") {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== "granted") {
//     alert("Notification permission denied!");
//     return null;
//   }

//   token = (await Notifications.getExpoPushTokenAsync()).data;
//   console.log("📲 Expo Push Token:", token);

//   if (Platform.OS === "android") {
//     await Notifications.setNotificationChannelAsync("default", {
//       name: "default",
//       importance: Notifications.AndroidImportance.MAX,
//     });
//   }

//   return token;
// }

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Push notification permission denied!");
    return null;
  }

  // ✅ IMPORTANT FIX
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.manifest?.extra?.eas?.projectId;

  if (!projectId) {
    console.error("❌ Expo projectId NOT found");
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  console.log("✅ Expo Push Token:", token);
  return token;
}
