import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


export async function registerForPushNotificationsAsync(): Promise<string | null> {

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


  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants.manifest as any)?.extra?.eas?.projectId;

  if (!projectId) {
    console.error("❌ Expo projectId NOT found. Make sure you are logged into Expo.");
    return null;
  }

  try {

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    //console.log("✅ Expo Push Token:", token);


    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default Notification Channel",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } catch (error) {
    console.error("❌ Failed to get push token:", error);
    return null;
  }
}