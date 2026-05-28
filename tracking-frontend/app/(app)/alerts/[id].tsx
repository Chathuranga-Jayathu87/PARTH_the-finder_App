import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getAlerts } from "@/src/services/dataService";

export default function AlertDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [alert, setAlert] = useState<any>(null);

  useEffect(() => {

    const getAlertById = async (alertId: string) => {
      const alerts = await getAlerts();
      return alerts.find((a: any) => a.user_id === alertId);
    }
    getAlertById(id as string).then(setAlert);
  }, [id]);

  if (!alert) return <ActivityIndicator />;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {alert.alert_type}
      </Text>

      <Text>{alert.message}</Text>
      <Text>📍 Latitude: {alert.lat}</Text>
      <Text>📍 Longitude: {alert.lng}</Text>
      <Text>🕒 {new Date(alert.created_at).toLocaleString()}</Text>
    </View>
  );
}
