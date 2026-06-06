import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAlerts } from "@/src/services/dataService";

/* ================= TYPES ================= */
interface AlertData {
  id: string | number;
  user_id: string | number;
  alert_type: string;
  message: string;
  lat: number;
  lng: number;
  created_at: string;
  status?: string;
}

export default function AlertDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* 📥 FETCH ALERT BY ID */
  useEffect(() => {
    if (!id) return;

    const fetchAlertDetail = async () => {
      try {
        setLoading(true);
        const alerts = await getAlerts();
        
        // 👈 බග් එක ෆික්ස් කරා: user_id වෙනුවට alert එකේ තියෙන නිවැරදි id එකෙන් find කරනවා
        // (ඔයාගේ backend එකේ එන්නේ alert_id නම් a.alert_id විදිහට වෙනස් කරන්න)
        const foundAlert = alerts.find((a: any) => String(a.id || a.alert_id) === String(id));
        
        if (foundAlert) {
          // normalize backend Alert shape to AlertData expected by this component
          const normalized: AlertData = {
            id: foundAlert.id ?? foundAlert.alert_id ?? "",
            user_id: foundAlert.user_id ?? (foundAlert.userId as any) ?? "",
            alert_type: foundAlert.alert_type ?? foundAlert.type ?? "",
            message: foundAlert.message ?? foundAlert.body ?? "",
            lat: Number(foundAlert.lat ?? foundAlert.latitude ?? 0),
            lng: Number(foundAlert.lng ?? foundAlert.longitude ?? 0),
            created_at: foundAlert.created_at ?? foundAlert.createdAt ?? new Date().toISOString(),
            status: foundAlert.status ?? (foundAlert.state as any) ?? undefined,
          };

          setAlert(normalized);
        } else {
          console.error("Alert not found for ID:", id);
        }
      } catch (error) {
        console.error("Failed to fetch alert details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlertDetail();
  }, [id]);

  /* ⏳ LOADING STATE */
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loadingText}>Loading alert details...</Text>
      </View>
    );
  }

  /* 🚫 NOT FOUND STATE */
  if (!alert) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#8e8e93" />
        <Text style={styles.errorText}>Alert data not found.</Text>
      </View>
    );
  }

  // ඇලර්ට් ටයිප් එක අනුව අයිකන් සහ වර්ණ තෝරාගැනීම
  const isRedAlert = alert.alert_type?.toUpperCase().includes("SOS") || alert.alert_type?.toUpperCase().includes("CRITICAL");
  const themeColor = isRedAlert ? "#FF3B30" : "#FF9500";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* 🚨 ALERT HEADER CARD */}
      <View style={[styles.headerCard, { borderLeftColor: themeColor }]}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={isRedAlert ? "skull-outline" : "warning-outline"} 
            size={24} 
            color={themeColor} 
          />
          <Text style={[styles.alertType, { color: themeColor }]}>
            {alert.alert_type || "Unknown Alert"}
          </Text>
        </View>
        <Text style={styles.timeText}>
          🕒 {new Date(alert.created_at).toLocaleString()}
        </Text>
      </View>

      {/* 💬 MESSAGE SECTION */}
      <Text style={styles.sectionLabel}>Message Details</Text>
      <View style={styles.detailsCard}>
        <Text style={styles.messageText}>{alert.message || "No description provided."}</Text>
      </View>

      {/* 📍 LOCATION SECTION */}
      <Text style={styles.sectionLabel}>Location Coords</Text>
      <View style={styles.detailsCard}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={20} color="#3f51b5" />
          <View style={styles.geoTextWrap}>
            <Text style={styles.geoLabel}>Latitude</Text>
            <Text style={styles.geoValue}>{Number(alert.lat).toFixed(6)}</Text>
          </View>
        </View>
        
        <View style={[styles.locationRow, { marginTop: 12, borderTopWidth: 0.5, borderTopColor: '#e5e5ea', paddingTop: 12 }]}>
          <Ionicons name="location-outline" size={20} color="#3f51b5" />
          <View style={styles.geoTextWrap}>
            <Text style={styles.geoLabel}>Longitude</Text>
            <Text style={styles.geoValue}>{Number(alert.lng).toFixed(6)}</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7", // 🍏 Standard clean background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: "#8e8e93",
    fontWeight: "500",
  },
  headerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  alertType: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 13,
    color: "#8e8e93",
    fontWeight: "500",
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6e6e73",
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1c1c1e",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  geoTextWrap: {
    marginLeft: 12,
  },
  geoLabel: {
    fontSize: 12,
    color: "#8e8e93",
    fontWeight: "500",
  },
  geoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
    marginTop: 2,
  },
});