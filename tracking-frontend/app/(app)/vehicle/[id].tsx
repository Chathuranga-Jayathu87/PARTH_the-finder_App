// app/(app)/vehicle/[id].tsx - The main tracking screen for a single vehicle

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
// 🚀 Import the Socket.IO client library (needs to be installed)
// import io, { Socket } from 'socket.io-client'; 

// --- TYPE DEFINITIONS ---

// Define the shape of the live vehicle data
interface VehicleData {
    id: string;
    plate: string;
    model: string;
    status: string;
    ignition: boolean;
    fuel: number;
    speed: number;
    liveCoords: { latitude: number; longitude: number };
}

// Define the required props for the StatusCard component
interface StatusCardProps {
    iconName: keyof typeof Ionicons.glyphMap; // Ensures iconName is a valid Ionicons string
    title: string;
    value: string;
    color: string;
}


// Placeholder data structure (Type safety applied)
const mockVehicleData: VehicleData = {
    id: 'PBX-1578-ID',
    plate: 'PBX-1578',
    model: 'Toyota Hiace',
    status: 'Moving',
    ignition: true,
    fuel: 75,
    speed: 65,
    liveCoords: { latitude: 6.95, longitude: 79.88 },
};

// --- VEHICLE DETAIL SCREEN COMPONENT ---

export default function VehicleDetailScreen() {
    // Specify the expected type for the dynamic route parameter
    const { id } = useLocalSearchParams<{ id: string }>(); 
    // State is typed to hold VehicleData or null initially
    const [vehicle, setVehicle] = useState<VehicleData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch initial vehicle details
        const fetchVehicle = async () => {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // 💡 In a real app, you would fetch the last known state from your REST API here:
            // const initialData = await fetch(`/api/vehicles/${id}`).json();
            
            setVehicle(mockVehicleData);
            setLoading(false);
            
            // 🚀 TODO: 2. Initialize Socket.IO connection (See next step)
        };

        fetchVehicle();
        
        // 3. Cleanup function (important for Socket.IO, although not implemented yet)
        return () => {
            // socket.disconnect(); 
        };
    }, [id]); // Re-run effect if the vehicle ID changes

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3f51b5" />
                <Text style={styles.loadingText}>Loading Vehicle Data...</Text>
            </View>
        );
    }
    
    if (!vehicle) {
        return <Text style={styles.centerContainer}>Vehicle not found.</Text>;
    }

    // Define map region centered on the vehicle (Type safety for Region applied)
    const mapRegion: Region = {
        latitude: vehicle.liveCoords.latitude,
        longitude: vehicle.liveCoords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    };

    return (
        <ScrollView style={styles.container}>
            
            {/* 1. Header and Vehicle Info */}
            <View style={styles.header}>
                <Text style={styles.plateText}>{vehicle.plate}</Text>
                <Text style={styles.modelText}>{vehicle.model}</Text>
            </View>

            {/* 2. Status Indicators */}
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

            {/* 3. Live Map */}
            <View style={styles.mapWrapper}>
                <Text style={styles.mapHeader}>Live Location</Text>
                <MapView
                    style={styles.map}
                    initialRegion={mapRegion}
                    showsUserLocation={true}
                    // Optional: You might want to use region={mapRegion} 
                    // and onRegionChange to manage the map position state
                >
                    <Marker
                        coordinate={vehicle.liveCoords}
                        title={vehicle.plate}
                        description={vehicle.status}
                    >
                        {/* Custom Marker with Ionicons */}
                        <Ionicons name="car" size={30} color="#3f51b5" />
                    </Marker>
                </MapView>
            </View>
            
        </ScrollView>
    );
}

// --- STATUS CARD COMPONENT ---

// Component is typed using the interface
const StatusCard: React.FC<StatusCardProps> = ({ iconName, title, value, color }) => (
    <View style={styles.statusCard}>
        <Ionicons name={iconName} size={28} color={color} />
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
);

// --- STYLES ---

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#fff' 
    },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    plateText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    modelText: { fontSize: 16, color: '#666' },
    
    statusRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        padding: 10, 
    },
    statusCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 5,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    cardTitle: { fontSize: 13, color: '#666', marginTop: 5 },
    cardValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
    
    mapWrapper: {
        margin: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 2,
    },
    mapHeader: {
        fontSize: 16,
        fontWeight: '600',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    map: {
        height: 400,
        width: '100%',
    },
});





// app/(app)/vehicle/[id].tsx (Socket.IO Integration)

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import MapView, { Marker, Region } from 'react-native-maps';
// import io, { Socket } from 'socket.io-client'; // 🚀 IMPORT Socket.IO Client

// // --- TYPE DEFINITIONS ---
// // (Keep your existing VehicleData and StatusCardProps interfaces)
// // ...

// // 🚀 Backend URL (CHANGE THIS!)
// const SOCKET_SERVER_URL = 'YOUR_BACKEND_SOCKET_IO_URL'; 
// // Example: const SOCKET_SERVER_URL = 'http://192.168.1.10:3000';

// // Placeholder data structure (Keep your existing mock data)
// // ...

// // --- VEHICLE DETAIL SCREEN COMPONENT ---

// export default function VehicleDetailScreen() {
//     const { id } = useLocalSearchParams<{ id: string }>(); 
//     const [vehicle, setVehicle] = useState<VehicleData | null>(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         let socket: Socket | undefined;

//         // 1. Fetch initial vehicle details (Last known state)
//         const fetchVehicle = async () => {
//             // NOTE: In a real app, you would fetch the last known state from your REST API here.
//             await new Promise(resolve => setTimeout(resolve, 500)); 
            
//             // Set the initial data (e.g., from the API response)
//             setVehicle(mockVehicleData);
//             setLoading(false);
            
//             // 2. Initialize Socket.IO connection
//             try {
//                 // Connect to the Socket.IO server
//                 socket = io(SOCKET_SERVER_URL);
                
//                 // 🚀 Join a room specific to this vehicle ID
//                 socket.emit('joinVehicleRoom', id); 

//                 // 🚀 Listen for real-time updates for this vehicle
//                 socket.on('vehicleUpdate', (updateData: Partial<VehicleData>) => {
//                     setVehicle(prevVehicle => {
//                         if (prevVehicle) {
//                             // Merge the old data with the new live update
//                             return { ...prevVehicle, ...updateData };
//                         }
//                         return null;
//                     });
//                 });

//                 console.log(`Socket connected for vehicle ID: ${id}`);
                
//             } catch (error) {
//                 console.error("Socket connection failed:", error);
//             }
//         };

//         fetchVehicle();
        
//         // 3. Cleanup function: Disconnect the socket when the component unmounts
//         return () => {
//             if (socket) {
//                 socket.emit('leaveVehicleRoom', id); // Optional: tell server we left
//                 socket.disconnect();
//                 console.log(`Socket disconnected for vehicle ID: ${id}`);
//             }
//         };
//     }, [id]); // Re-run effect if the vehicle ID changes

//     // ... (Keep your existing loading and vehicle check logic) ...

//     if (loading || !vehicle) {
//         return (
//             <View style={styles.centerContainer}>
//                 <ActivityIndicator size="large" color="#3f51b5" />
//                 <Text style={styles.loadingText}>{loading ? 'Loading Vehicle Data...' : 'Vehicle not found.'}</Text>
//             </View>
//         );
//     }
    
//     // Define map region centered on the vehicle (Updated state will drive map position)
//     const mapRegion: Region = {
//         latitude: vehicle.liveCoords.latitude,
//         longitude: vehicle.liveCoords.longitude,
//         latitudeDelta: 0.02,
//         longitudeDelta: 0.02,
//     };

//     // ... (Keep the rest of your return JSX code, which uses the 'vehicle' state) ...
//     return (
//         <ScrollView style={styles.container}>
            
//             {/* 1. Header and Vehicle Info */}
//             <View style={styles.header}>
//                 <Text style={styles.plateText}>{vehicle.plate}</Text>
//                 <Text style={styles.modelText}>{vehicle.model}</Text>
//             </View>

//             {/* 2. Status Indicators (These values will update live!) */}
//             <View style={styles.statusRow}>
//                 {/* ... Ignition, Speed, Fuel cards using vehicle state ... */}
//             </View>

//             {/* 3. Live Map (Marker coordinate will update live!) */}
//             <View style={styles.mapWrapper}>
//                 <Text style={styles.mapHeader}>Live Location</Text>
//                 <MapView
//                     style={styles.map}
//                     // 🚀 Key Improvement: Use 'region' instead of 'initialRegion'
//                     // This allows the map to automatically re-center when 'liveCoords' updates.
//                     region={mapRegion} 
//                     showsUserLocation={true}
//                 >
//                     <Marker
//                         coordinate={vehicle.liveCoords}
//                         title={vehicle.plate}
//                         description={vehicle.status}
//                     >
//                         <Ionicons name="car" size={30} color="#3f51b5" />
//                     </Marker>
//                 </MapView>
//             </View>
            
//         </ScrollView>
//     );
// }

// // ... (Keep your existing StatusCard component and styles) ...