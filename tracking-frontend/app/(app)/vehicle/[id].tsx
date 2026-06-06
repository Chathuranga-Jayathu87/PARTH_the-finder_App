import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps"; // 👈 PROVIDER_GOOGLE Import කරා
import { getVehicleById } from "@/src/services/vehicleService";
import { useVehicleSocket } from "@/src/hooks/useVehicleSocket";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ================= TYPES ================= */
interface VehicleData {
  id: string;
  plate: string;
  model: string;
  status: string;
  ignition: boolean;
  fuel: number;
  speed: number;
  heading: number; 
  liveCoords: {
    latitude: number;
    longitude: number;
  };
}

interface StatusCardProps {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  color: string;
  subValue?: string;
}

/* ================= HELPERS ================= */
const createEmptyVehicle = (id: string): VehicleData => ({
  id,
  plate: "",
  model: "",
  status: "Offline",
  ignition: false,
  fuel: 0,
  speed: 0,
  heading: 0,
  liveCoords: {
    latitude: 6.9271, // Colombo default
    longitude: 79.8612,
  },
});

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mapRef = useRef<MapView | null>(null); 
  const { liveData, connected } = useVehicleSocket(id);

  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* -------- 1. LOAD STATIC VEHICLE DATA -------- */
  useEffect(() => {
    if (!id) return;

    const loadVehicle = async () => {
      try {
        setLoading(true);
        const data = await getVehicleById(id);
        
        setVehicle({
          id: String(data.vehicle_id),
          plate: data.license_plate,
          model: data.make_model,
          status: data.online ? "Online" : "Offline",
          ignition: Boolean(data.ignition_status),
          fuel: data.fuel ?? 0,
          speed: data.speed ?? 0,
          heading: data.heading ?? 0,
          liveCoords: {
            latitude: Number(data.lat) || 6.9271,
            longitude: Number(data.lng) || 79.8612,
          },
        });
      } catch (err) {
        console.error("Failed to load vehicle static data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id]);

  /* -------- 2. LIVE SOCKET DATA UPDATE -------- */
  useEffect(() => {
    if (!liveData) return;

    setVehicle((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        speed: liveData.speed ?? prev.speed,
        fuel: liveData.fuel ?? prev.fuel,
        ignition: liveData.ignition ?? prev.ignition,
        // liveData may not include heading in its type; coerce to any to safely read if present
        heading: (liveData as any).heading ?? prev.heading,
        status: connected ? "Online" : "Offline",
        liveCoords: {
          latitude: liveData.latitude ?? prev.liveCoords.latitude,
          longitude: liveData.longitude ?? prev.liveCoords.longitude,
        },
      };
    });
  }, [liveData, connected]);

  /* -------- 3. MAP ANIMATION EFFECT -------- */
  useEffect(() => {
    if (liveData?.latitude && liveData?.longitude && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: liveData.latitude,
          longitude: liveData.longitude,
          latitudeDelta: 0.006, 
          longitudeDelta: 0.006,
        },
        1000 
      );
    }
  }, [liveData?.latitude, liveData?.longitude]);

  /* ================= UI ================= */
  if (loading || !vehicle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loading}>Connecting to JumboWatch GPS...</Text>
      </View>
    );
  }

  const initialMapRegion: Region = {
    latitude: vehicle.liveCoords.latitude,
    longitude: vehicle.liveCoords.longitude,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  return (
    <View style={styles.container}>
      
      {/* 🗺️ GOOGLE MAP VIEW */}
      <MapView
        ref={mapRef}
        style={styles.fullMap}
        provider={PROVIDER_GOOGLE} // 👈 මෙතනින් Google Maps ප්ලගින් එක Force කරා
        initialRegion={initialMapRegion}
        showsUserLocation={true}
        showsCompass={true}
        rotateEnabled={true} 
      >
        <Marker 
          coordinate={vehicle.liveCoords}
          flat={true} 
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={[styles.markerWrap, { transform: [{ rotate: `${vehicle.heading}deg` }] }]}>
            <View style={[styles.markerCircle, { backgroundColor: vehicle.status === "Online" ? "#3f51b5" : "#757575" }]}>
              <Ionicons name="navigate" size={18} color="#fff" />
            </View>
            <View style={styles.markerArrow} />
          </View>
        </Marker>
      </MapView>

      {/* 💳 FLOATING BOTTOM PANEL */}
      <View style={styles.bottomSheet}>
        <View style={styles.indicator} />

        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.plate}>{vehicle.plate || "No Plate"}</Text>
            <Text style={styles.model}>{vehicle.model || "Standard Tracker Device"}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: vehicle.status === "Online" ? "#E8F5E9" : "#F5F5F5" }]}>
            <View style={[styles.pulseDot, { backgroundColor: vehicle.status === "Online" ? "#4CAF50" : "#9E9E9E" }]} />
            <Text style={[styles.statusText, { color: vehicle.status === "Online" ? "#2E7D32" : "#616161" }]}>
              {vehicle.status}
            </Text>
          </View>
        </View>

        {/* Dashboard Cards Grid */}
        <View style={styles.statusRow}>
          <StatusCard
            iconName={vehicle.ignition ? "flash" : "flash-off"}
            title="Ignition"
            value={vehicle.ignition ? "ON" : "OFF"}
            color={vehicle.ignition ? "#4CAF50" : "#FF5722"}
            subValue={vehicle.ignition ? "Engine Running" : "Engine Idle"}
          />

          <StatusCard
            iconName="speedometer-outline"
            title="Live Speed"
            value={`${vehicle.speed} km/h`}
            color="#3f51b5"
            subValue={vehicle.speed > 60 ? "Overspeeding" : "Normal"}
          />

          <StatusCard
            iconName="water-outline"
            title="Fuel Level"
            value={`${vehicle.fuel}%`}
            color={vehicle.fuel < 20 ? "#FFB300" : "#00BCD4"}
            subValue={`${Math.round(vehicle.fuel * 0.5)} Liters`} 
          />
        </View>
      </View>

    </View>
  );
}

/* ================= COMPONENTS ================= */
const StatusCard: React.FC<StatusCardProps> = ({ iconName, title, value, color, subValue }) => (
  <View style={styles.card}>
    <View style={[styles.cardIconBg, { backgroundColor: color + '12' }]}>
      <Ionicons name={iconName} size={22} color={color} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={[styles.cardValue, { color }]}>{value}</Text>
    {subValue && <Text style={styles.cardSubValue}>{subValue}</Text>}
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9f9f9" },
  loading: { marginTop: 12, color: "#444", fontWeight: "500", fontSize: 14 },

  fullMap: {
    width: "100%",
    height: SCREEN_HEIGHT - 220, 
  },

  markerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#3f51b5',
    position: 'absolute',
    top: -4, 
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  plate: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  model: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -4,
  },
  card: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    marginHorizontal: 4,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f3f5",
  },
  cardIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 11, color: "#7a7a7a", fontWeight: "600" },
  cardValue: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  cardSubValue: { fontSize: 10, color: "#999", marginTop: 2, fontWeight: "500" },
});