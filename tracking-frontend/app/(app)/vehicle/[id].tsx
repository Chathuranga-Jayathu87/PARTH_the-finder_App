// // app/(app)/vehicle/[id].tsx - The main tracking screen for a single vehicle

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import MapView, { Marker, Region } from 'react-native-maps';
// // 🚀 Import the Socket.IO client library (needs to be installed)
//  import  { io,Socket } from 'socket.io-client'; 


//  const SOCKET_URL = 'http://172.20.10.3:5000';





// // --- TYPE DEFINITIONS ---

// // Define the shape of the live vehicle data
// interface VehicleData {
//     id: string;
//     plate: string;
//     model: string;
//     status: string;
//     ignition: boolean;
//     fuel: number;
//     speed: number;
//     liveCoords: { latitude: number; longitude: number };
// }

// // Define the required props for the StatusCard component
// interface StatusCardProps {
//     iconName: keyof typeof Ionicons.glyphMap; // Ensures iconName is a valid Ionicons string
//     title: string;
//     value: string;
//     color: string;
// }


// const createEmptyVehicle = (id: string): VehicleData => ({
//   id,
//   plate: "Loading...",
//   model: "Loading...",
//   status: "Unknown",
//   ignition: false,
//   fuel: 0,
//   speed: 0,
//   liveCoords: {
//     latitude: 6.9319,   // Colombo default
//     longitude: 79.8684,
//   },
// });


// // --- VEHICLE DETAIL SCREEN COMPONENT ---

// export default function VehicleDetailScreen() {
//     const socketRef = React.useRef<Socket | null>(null);
//     // Specify the expected type for the dynamic route parameter
//     const { id } = useLocalSearchParams<{ id: string }>(); 
//     // State is typed to hold VehicleData or null initially
//     const [vehicle, setVehicle] = useState<VehicleData | null>(null);
//     const [loading, setLoading] = useState(true);



// useEffect(() => {
//   // ✅ 1. Create initial vehicle object
//   setVehicle(createEmptyVehicle(id));
//   setLoading(false);

//   // ✅ 2. Connect socket
//   socketRef.current = io(SOCKET_URL, {
//     transports: ["websocket"],
//   });

//   socketRef.current.on("connect", () => {
//     console.log("✅ Socket connected");
//   });

//   // ✅ 3. Listen for live GPS updates
//   socketRef.current.on("vehicle_update", (data) => {
//     if (String(data.vehicle_id) !== String(id)) return;
//     console.log(id);
//     console.log(data);
//     setVehicle(prev => {
//       if (!prev) return prev;

//       return {
//         ...prev,
//         speed: data.speed ?? prev.speed,
//         fuel: data.fuel ?? prev.fuel,
//         ignition: data.ignition ?? prev.ignition,
//         status: data.speed > 0 ? "Moving" : "Stopped",
//         liveCoords: {
//           latitude: data.latitude,
//           longitude: data.longitude,
//         },
//       };
//     });
//   });

//   return () => {
//     socketRef.current?.disconnect();
//     console.log("❌ Socket disconnected");
//   };
// }, [id]);





//     if (loading) {
//         return (
//             <View style={styles.centerContainer}>
//                 <ActivityIndicator size="large" color="#3f51b5" />
//                 <Text style={styles.loadingText}>Loading Vehicle Data...</Text>
//             </View>
//         );
//     }
    
//     if (!vehicle) {
//         return <Text style={styles.centerContainer}>Vehicle not found.</Text>;
//     }

   
//         const mapRegion: Region = {
//     latitude: vehicle?.liveCoords.latitude ?? 6.9319,
//     longitude: vehicle?.liveCoords.longitude ?? 79.8684,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
//     };


//     return (
//         <ScrollView style={styles.container}>
            
//             {/* 1. Header and Vehicle Info */}
//             <View style={styles.header}>
//                 <Text style={styles.plateText}>{vehicle.plate}</Text>
//                 <Text style={styles.modelText}>{vehicle.model}</Text>
//             </View>

//             {/* 2. Status Indicators */}
//             <View style={styles.statusRow}>
//                 <StatusCard 
//                     iconName={vehicle.ignition ? "flash" : "flash-off"}
//                     title="Ignition"
//                     value={vehicle.ignition ? "ON" : "OFF"}
//                     color={vehicle.ignition ? "#4CAF50" : "#FF5722"}
//                 />
//                 <StatusCard 
//                     iconName="speedometer"
//                     title="Speed"
//                     value={`${vehicle.speed} km/h`}
//                     color="#3f51b5"
//                 />
//                 <StatusCard 
//                     iconName="water"
//                     title="Fuel"
//                     value={`${vehicle.fuel}%`}
//                     color={vehicle.fuel < 20 ? "#FFC107" : "#00BCD4"}
//                 />
//             </View>

//             {/* 3. Live Map */}
//             <View style={styles.mapWrapper}>
//                 <Text style={styles.mapHeader}>Live Location</Text>
//                 <MapView
//                     style={styles.map}  //initialRegion={mapRegion}
//                     region={mapRegion}
//                     showsUserLocation={true}
//                     // Optional: You might want to use region={mapRegion} 
//                     // and onRegionChange to manage the map position state
//                 >
//                     <Marker
//                         coordinate={vehicle.liveCoords}
//                         title={vehicle.plate}
//                         description={vehicle.status}
//                     >
//                         {/* Custom Marker with Ionicons */}
//                         <Ionicons name="car" size={30} color="#3f51b5" />
//                     </Marker>
//                 </MapView>
//             </View>
            
//         </ScrollView>
//     );
// }

// // --- STATUS CARD COMPONENT ---

// // Component is typed using the interface
// const StatusCard: React.FC<StatusCardProps> = ({ iconName, title, value, color }) => (
//     <View style={styles.statusCard}>
//         <Ionicons name={iconName} size={28} color={color} />
//         <Text style={styles.cardTitle}>{title}</Text>
//         <Text style={[styles.cardValue, { color }]}>{value}</Text>
//     </View>
// );

// // --- STYLES ---

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f5f5f5' },
//     centerContainer: { 
//         flex: 1, 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         backgroundColor: '#fff' 
//     },
//     loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    
//     header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
//     plateText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
//     modelText: { fontSize: 16, color: '#666' },
    
//     statusRow: { 
//         flexDirection: 'row', 
//         justifyContent: 'space-between', 
//         padding: 10, 
//     },
//     statusCard: {
//         flex: 1,
//         backgroundColor: '#fff',
//         padding: 15,
//         marginHorizontal: 5,
//         borderRadius: 8,
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//         elevation: 3,
//     },
//     cardTitle: { fontSize: 13, color: '#666', marginTop: 5 },
//     cardValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
    
//     mapWrapper: {
//         margin: 10,
//         borderRadius: 8,
//         overflow: 'hidden',
//         backgroundColor: '#fff',
//         elevation: 2,
//     },
//     mapHeader: {
//         fontSize: 16,
//         fontWeight: '600',
//         padding: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     map: {
//         height: 400,
//         width: '100%',
//     },
// });




import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Region } from "react-native-maps";
import { io, Socket } from "socket.io-client";
import { getVehicleById } from "@/src/services/vehicleService";
import { useVehicleSocket } from "@/src/hooks/useVehicleSocket";

/* ================= CONFIG ================= */

const API_URL = "http://172.20.10.3:5000/api";   // REST API
const SOCKET_URL = "http://172.20.10.3:5000";   // Socket.IO

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
    latitude: 6.9271,     // Colombo default
    longitude: 79.8612,
  },
});

/* ================= SCREEN ================= */

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const socketRef = useRef<Socket | null>(null);
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

       
        const data =await getVehicleById(id);


        console.log(data.license_plate);

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

  /* -------- SOCKET.IO (LIVE DATA) -------- */
//   useEffect(() => {
//     if (!id) return;

//     socketRef.current = io(SOCKET_URL, {
//       transports: ["websocket"],
//     });

//     socketRef.current.on("connect", () => {
//       console.log("✅ Socket connected");
//       socketRef.current?.emit("join_vehicle", id);
//     });

//     socketRef.current.on("vehicle_update", (data) => {
//       if (String(data.vehicle_id) !== String(id)) return;
//         console.log(data);
//       setVehicle((prev) => {
//         if (!prev) return prev;

//         return {
//           ...prev,
//           speed: data.speed ?? prev.speed,
//           fuel: data.fuel ?? prev.fuel,
//           ignition: data.ignition ?? prev.ignition,
//           status: "Moving",
//           liveCoords: {
//             latitude: data.latitude,
//             longitude: data.longitude,
//           },
//         };
//       });
//     });

//     return () => {
//       socketRef.current?.disconnect();
//       console.log("❌ Socket disconnected");
//     };
//   }, [id]);

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

  const mapRegion: Region = {
    latitude: vehicle.liveCoords.latitude,
    longitude: vehicle.liveCoords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.plate}>
          {vehicle.plate || "Vehicle"}
        </Text>
        <Text style={styles.model}>
          {vehicle.model || "Unknown Model"}
        </Text>
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
        <MapView style={styles.map} region={mapRegion}>
          <Marker coordinate={vehicle.liveCoords}>
            <Ionicons name="car" size={32} color="#3f51b5" />
          </Marker>
        </MapView>
      </View>
    </ScrollView>
  );
}

/* ================= COMPONENTS ================= */

const StatusCard: React.FC<StatusCardProps> = ({ iconName, title, value, color }) => (
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



// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import MapView, { Marker, Region } from "react-native-maps";

// import { getVehicleById } from "@/src/services/vehicleService";
// import { useVehicleSocket } from "@/src/hooks/useVehicleSocket";

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
//     latitude: 6.9271, // Colombo default
//     longitude: 79.8612,
//   },
// });

// /* ================= SCREEN ================= */

// export default function VehicleDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();

//   const [vehicle, setVehicle] = useState<VehicleData | null>(null);
//   const [loading, setLoading] = useState(true);

//   /* 🔌 Live socket hook */
//   const { liveData, connected } = useVehicleSocket(id);

//   /* -------- LOAD STATIC VEHICLE DATA -------- */
//   useEffect(() => {
//     if (!id) return;

//     const loadVehicle = async () => {
//       try {
//         setLoading(true);
//         setVehicle(createEmptyVehicle(id));

//         const data = await getVehicleById(id);

//         setVehicle({
//           id: String(data.vehicle_id),
//           plate: data.license_plate,
//           model: data.make_model,
//           status: data.online ? "Online" : "Offline",
//           ignition: Boolean(data.ignition_status),
//           fuel: data.fuel ?? 0,
//           speed: data.speed ?? 0,
//           liveCoords: {
//             latitude: data.lat ?? 6.9271,
//             longitude: data.lng ?? 79.8612,
//           },
//         });
//       } catch (err) {
//         console.error("Failed to load vehicle", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadVehicle();
//   }, [id]);

//   /* -------- APPLY LIVE SOCKET UPDATES -------- */
//   useEffect(() => {
//     if (!liveData || !vehicle) return;

//     setVehicle((prev) => {
//       if (!prev) return prev;

//       return {
//         ...prev,
//         speed: liveData.speed ?? prev.speed,
//         fuel: liveData.fuel ?? prev.fuel,
//         ignition: liveData.ignition ?? prev.ignition,
//         status: connected ? "Online" : "Offline",
//         liveCoords: {
//           latitude: liveData.latitude ?? prev.liveCoords.latitude,
//           longitude: liveData.longitude ?? prev.liveCoords.longitude,
//         },
//       };
//     });
//   }, [liveData, connected, vehicle]);

//   /* ================= UI ================= */

//   if (loading || !vehicle) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#3f51b5" />
//         <Text style={styles.loadingText}>Loading vehicle...</Text>
//       </View>
//     );
//   }

//   const mapRegion: Region = {
//     latitude: vehicle.liveCoords.latitude,
//     longitude: vehicle.liveCoords.longitude,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <Text style={styles.plateText}>{vehicle.plate}</Text>
//         <Text style={styles.modelText}>{vehicle.model}</Text>
//         <Text
//           style={[
//             styles.statusText,
//             { color: connected ? "green" : "red" },
//           ]}
//         >
//           {connected ? "Live" : "Offline"}
//         </Text>
//       </View>

//       {/* STATUS CARDS */}
//       <View style={styles.statusRow}>
//         <StatusCard
//           iconName={vehicle.ignition ? "flash" : "flash-off"}
//           title="Ignition"
//           value={vehicle.ignition ? "ON" : "OFF"}
//           color={vehicle.ignition ? "#4CAF50" : "#F44336"}
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

// const StatusCard = ({
//   iconName,
//   title,
//   value,
//   color,
// }: {
//   iconName: keyof typeof Ionicons.glyphMap;
//   title: string;
//   value: string;
//   color: string;
// }) => (
//   <View style={styles.statusCard}>
//     <Ionicons name={iconName} size={28} color={color} />
//     <Text style={styles.cardTitle}>{title}</Text>
//     <Text style={[styles.cardValue, { color }]}>{value}</Text>
//   </View>
// );

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },

//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   loadingText: { marginTop: 10, color: "#666" },

//   header: {
//     padding: 20,
//     backgroundColor: "#fff",
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },

//   plateText: { fontSize: 24, fontWeight: "bold", color: "#333" },
//   modelText: { fontSize: 16, color: "#666" },
//   statusText: { marginTop: 4, fontWeight: "600" },

//   statusRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//   },

//   statusCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 15,
//     marginHorizontal: 5,
//     borderRadius: 8,
//     alignItems: "center",
//     elevation: 3,
//   },

//   cardTitle: { fontSize: 13, color: "#666", marginTop: 5 },
//   cardValue: { fontSize: 18, fontWeight: "700", marginTop: 2 },

//   mapWrapper: {
//     margin: 10,
//     borderRadius: 8,
//     overflow: "hidden",
//     backgroundColor: "#fff",
//   },

//   mapHeader: {
//     fontSize: 16,
//     fontWeight: "600",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },

//   map: {
//     height: 400,
//     width: "100%",
//   },
// });
