import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { router } from "expo-router";

export function useNotificationNavigation() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.alertId) {
          router.push(`/alerts/${data.alertId}`);
        }
      },
    );

    return () => subscription.remove();
  }, []);
}
