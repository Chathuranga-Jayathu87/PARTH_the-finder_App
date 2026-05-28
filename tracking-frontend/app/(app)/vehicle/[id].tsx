// import React, { useEffect, useRef, useState } from "react";
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
// import { useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import MapView, { Marker, Region } from "react-native-maps";
// import { io, Socket } from "socket.io-client";
// import { getVehicleById } from "@/src/services/vehicleService";
// import { useVehicleSocket } from "@/src/hooks/useVehicleSocket";

// /* ================= CONFIG ================= */

// const API_URL = "http://169.254.16.170:5000/api";   // REST API
// const SOCKET_URL = "http://169.254.16.170:5000";   // Socket.IO

// /* ================= TYPES ================= */

// interface VehicleData {
//   id: string;
//   plate: string;
//   model: string;
//   status: string;
//   ignition: boolean;
//   fuel: number;
//   speed: number;
//   liveCoords: {
//     latitude: number;
//     longitude: number;
//   };
// }

// interface StatusCardProps {
//   iconName: keyof typeof Ionicons.glyphMap;
//   title: string;
//   value: string;
//   color: string;
// }

// /* ================= HELPERS ================= */

// const createEmptyVehicle = (id: string): VehicleData => ({
//   id,
//   plate: "",
//   model: "",
//   status: "Offline",
//   ignition: false,
//   fuel: 0,
//   speed: 0,
//   liveCoords: {
//     latitude: 6.9271,     // Colombo default
//     longitude: 79.8612,
//   },
// });

// /* ================= SCREEN ================= */

// export default function VehicleDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const socketRef = useRef<Socket | null>(null);
//   const { liveData, connected } = useVehicleSocket(id);

//   const [vehicle, setVehicle] = useState<VehicleData | null>(null);
//   const [loading, setLoading] = useState(true);

//   /* -------- LOAD STATIC VEHICLE DATA -------- */
//   useEffect(() => {
//     if (!id) return;

//     const loadVehicle = async () => {
//       try {
//         setLoading(true);
//         setVehicle(createEmptyVehicle(id));

//         const data =await getVehicleById(id);

//         console.log(data.license_plate);

//         setVehicle({
//       id: String(data.vehicle_id),
//       plate: data.license_plate,
//       model: data.make_model,
//       status: data.online ? "Online" : "Offline",
//       ignition: Boolean(data.ignition_status),
//       fuel: data.fuel,
//       speed: data.speed,
//       liveCoords: {
//         latitude: data.lat,
//         longitude: data.lng,
//       },
//     });

//         setLoading(false);
//       } catch (err) {
//         console.error("Failed to load vehicle", err);
//         setLoading(false);
//       }
//     };

//     loadVehicle();
//   }, [id]);

// useEffect(() => {
//   if (!liveData || !vehicle) return;

//   setVehicle((prev) => {
//     if (!prev) return prev;

//     return {
//       ...prev,
//       speed: liveData.speed ?? prev.speed,
//       fuel: liveData.fuel ?? prev.fuel,
//       ignition: liveData.ignition ?? prev.ignition,
//       status: connected ? "Online" : "Offline",
//       liveCoords: {
//         latitude: liveData.latitude ?? prev.liveCoords.latitude,
//         longitude: liveData.longitude ?? prev.liveCoords.longitude,
//       },
//     };
//   });
// }, [liveData, connected]);

// /* ================= UI ================= */

//   if (loading || !vehicle) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#3f51b5" />
//         <Text style={styles.loading}>Loading vehicle...</Text>
//       </View>
//     );
//   }

//   const mapRegion: Region = {
//     latitude: vehicle.liveCoords.latitude,
//     longitude: vehicle.liveCoords.longitude,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={styles.plate}>
//           {vehicle.plate || "Vehicle"}
//         </Text>
//         <Text style={styles.model}>
//           {vehicle.model || "Unknown Model"}
//         </Text>
//       </View>

//       {/* STATUS */}
//       <View style={styles.statusRow}>
//         <StatusCard
//           iconName={vehicle.ignition ? "flash" : "flash-off"}
//           title="Ignition"
//           value={vehicle.ignition ? "ON" : "OFF"}
//           color={vehicle.ignition ? "#4CAF50" : "#FF5722"}
//         />

//         <StatusCard
//           iconName="speedometer"
//           title="Speed"
//           value={`${vehicle.speed} km/h`}
//           color="#3f51b5"
//         />

//         <StatusCard
//           iconName="water"
//           title="Fuel"
//           value={`${vehicle.fuel}%`}
//           color={vehicle.fuel < 20 ? "#FFC107" : "#00BCD4"}
//         />
//       </View>

//       {/* MAP */}
//       <View style={styles.mapWrapper}>
//         <Text style={styles.mapHeader}>Live Location</Text>
//         <MapView style={styles.map} region={mapRegion}>
//           <Marker coordinate={vehicle.liveCoords}>
//             <Ionicons name="car" size={32} color="#3f51b5" />
//           </Marker>
//         </MapView>
//       </View>
//     </ScrollView>
//   );
// }

// /* ================= COMPONENTS ================= */

// const StatusCard: React.FC<StatusCardProps> = ({ iconName, title, value, color }) => (
//   <View style={styles.card}>
//     <Ionicons name={iconName} size={26} color={color} />
//     <Text style={styles.cardTitle}>{title}</Text>
//     <Text style={[styles.cardValue, { color }]}>{value}</Text>
//   </View>
// );

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },

//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   loading: { marginTop: 10, color: "#666" },

//   header: {
//     padding: 20,
//     backgroundColor: "#fff",
//   },

//   plate: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },

//   model: {
//     fontSize: 16,
//     color: "#666",
//   },

//   statusRow: {
//     flexDirection: "row",
//     padding: 10,
//   },

//   card: {
//     flex: 1,
//     backgroundColor: "#fff",
//     marginHorizontal: 5,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     elevation: 3,
//   },

//   cardTitle: { fontSize: 13, color: "#666" },
//   cardValue: { fontSize: 18, fontWeight: "700" },

//   mapWrapper: {
//     margin: 10,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     overflow: "hidden",
//   },

//   mapHeader: {
//     padding: 10,
//     fontWeight: "600",
//   },

//   map: {
//     height: 400,
//   },
// });

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { getVehicleById } from "@/src/services/vehicleService";
import { useVehicleSocket } from "@/src/hooks/useVehicleSocket";

/* ================= CONFIG ================= */
const API_URL = "http://169.254.16.170:5000/api"; // REST API
const SOCKET_URL = "http://169.254.16.170:5000"; // Socket.IO

/* ================= TYPES ================= */
interface VehicleData {
  id: string;
  plate: string;
  model: string;
  status: string;
  ignition: boolean;
  fuel: number;
  speed: number;
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
  liveCoords: {
    latitude: 6.9271, // Colombo default
    longitude: 79.8612,
  },
});

/* ================= SCREEN ================= */
export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mapRef = useRef<MapView | null>(null); // 👈 Map එක ඇනිමේට් කරන්න Ref එකක් හැදුවා
  const { liveData, connected } = useVehicleSocket(id);

  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------- LOAD STATIC VEHICLE DATA -------- */
  useEffect(() => {
    if (!id) return;

    const loadVehicle = async () => {
      try {
        setLoading(true);
        setVehicle(createEmptyVehicle(id));

        const data = await getVehicleById(id);
        console.log("Vehicle Plate Loaded:", data.license_plate);

        setVehicle({
          id: String(data.vehicle_id),
          plate: data.license_plate,
          model: data.make_model,
          status: data.online ? "Online" : "Offline",
          ignition: Boolean(data.ignition_status),
          fuel: data.fuel,
          speed: data.speed,
          liveCoords: {
            latitude: data.lat,
            longitude: data.lng,
          },
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to load vehicle", err);
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id]);

  /* -------- LIVE SOCKET DATA UPDATE -------- */
  useEffect(() => {
    if (!liveData || !vehicle) return;

    setVehicle((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        speed: liveData.speed ?? prev.speed,
        fuel: liveData.fuel ?? prev.fuel,
        ignition: liveData.ignition ?? prev.ignition,
        status: connected ? "Online" : "Offline",
        liveCoords: {
          latitude: liveData.latitude ?? prev.liveCoords.latitude,
          longitude: liveData.longitude ?? prev.liveCoords.longitude,
        },
      };
    });

    // 👈 වාහනය යද්දී මැප් එක ස්මූත් විදිහට එහා මෙහා වෙන්න මෙතනින් ඇනිමේට් කරනවා
    if (liveData.latitude && liveData.longitude && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: liveData.latitude,
          longitude: liveData.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      ); // මිලි තත්පර 1000 ක ස්මූත් ඇනිමේෂන් එකක්
    }
  }, [liveData, connected]);

  /* ================= UI ================= */
  if (loading || !vehicle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loading}>Loading vehicle...</Text>
      </View>
    );
  }

  // මැප් එක මුලින්ම ඕපන් වෙද්දී පෙන්වන්න ඕන තැන (Initial Region)
  const initialMapRegion: Region = {
    latitude: vehicle.liveCoords.latitude,
    longitude: vehicle.liveCoords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.plate}>{vehicle.plate || "Vehicle"}</Text>
        <Text style={styles.model}>{vehicle.model || "Unknown Model"}</Text>
      </View>

      {/* STATUS */}
      <View style={styles.statusRow}>
        <StatusCard
          iconName={vehicle.ignition ? "flash" : "flash-off"}
          title="Ignition"
          value={vehicle.ignition ? "ON" : "OFF"}
          color={vehicle.ignition ? "#4CAF50" : "#FF5722"}
        />

        <StatusCard
          iconName="speedometer"
          title="Speed"
          value={`${vehicle.speed} km/h`}
          color="#3f51b5"
        />

        <StatusCard
          iconName="water"
          title="Fuel"
          value={`${vehicle.fuel}%`}
          color={vehicle.fuel < 20 ? "#FFC107" : "#00BCD4"}
        />
      </View>

      {/* MAP */}
      <View style={styles.mapWrapper}>
        <Text style={styles.mapHeader}>Live Location</Text>
        <MapView
          ref={mapRef} // 👈 Ref එක ලින්ක් කරා
          style={styles.map}
          initialRegion={initialMapRegion} // 👈 region වෙනුවට initialRegion පාවිච්චි කරා
        >
          <Marker coordinate={vehicle.liveCoords}>
            <Ionicons name="car" size={32} color="#3f51b5" />
          </Marker>
        </MapView>
      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */
const StatusCard: React.FC<StatusCardProps> = ({
  iconName,
  title,
  value,
  color,
}) => (
  <View style={styles.card}>
    <Ionicons name={iconName} size={26} color={color} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={[styles.cardValue, { color }]}>{value}</Text>
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: { marginTop: 10, color: "#666" },
  header: {
    padding: 20,
    backgroundColor: "#fff",
  },
  plate: {
    fontSize: 24,
    fontWeight: "bold",
  },
  model: {
    fontSize: 16,
    color: "#666",
  },
  statusRow: {
    flexDirection: "row",
    padding: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    elevation: 3,
  },
  cardTitle: { fontSize: 13, color: "#666" },
  cardValue: { fontSize: 18, fontWeight: "700" },
  mapWrapper: {
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  mapHeader: {
    padding: 10,
    fontWeight: "600",
  },
  map: {
    height: 400,
  },
});
