import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { router } from "expo-router";

interface NotificationData {
  alertId?: string | number;
  [key: string]: any;
}

export function useNotificationNavigation(): void {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data as NotificationData;

        
        if (data?.alertId) {
          
          router.push({
            pathname: "/alerts/[id]",
            params: { id: data.alertId.toString() }
          });
        }
      }
    );


    return () => subscription.remove();
  }, []);
}