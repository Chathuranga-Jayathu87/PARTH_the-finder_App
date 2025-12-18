// app/(app)/index.tsx - The main Home Screen/Dashboard

import React, { useState ,useCallback} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router,useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// NOTE: You will need to create this service file later to talk to your Node.js API
import { getRegisteredVehicles } from '../../src/services/dataService'; 


// --- TYPE DEFINITIONS ---
interface Vehicle {
    license_plate: string;
    make_model: string;
    vehicle_id: string; // The unique ID used for the dynamic route
}



export default function AppHome() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    useFocusEffect(
        useCallback(() => {
            const loadVehicles = async () => {
                setLoading(true);
                try {
                    const userVehicles = await getRegisteredVehicles(); 
                    setVehicles(userVehicles);
                } catch (error) {
                    console.error("Failed to load user vehicles:", error);
                } finally {
                    setLoading(false);
                }
            };

            loadVehicles();
            
            // Optional: return a cleanup function if needed
            return () => {}; 
        }, [])
    );
    // 🚀 Determine if the user has any vehicles
    const hasVehicles = vehicles.length > 0;

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3f51b5" />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }
    
    return (
        <ScrollView style={styles.container}>
            
            {/* 1. Header/Welcome Area */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome Back, User!</Text>
            </View>

            {/* 🚀 VEHICLE REGISTRATION CARD (Always visible for ease of access) */}
            <View style={styles.cardRow}>
                <TouchableOpacity
                    style={styles.statusCard}
                    onPress={() => router.push('/(app)/register-vehicle')}  
                >
                    <Ionicons name="add-sharp" size={30} color="#3f51b5" />
                    <Text style={styles.cardTitle}>Vehicle Registration</Text>
                </TouchableOpacity>
            </View>
            
            {/* ------------------------------------------------------------- */}
            {/* 🚀 CONDITIONAL DASHBOARD CONTENT */}
            {/* ------------------------------------------------------------- */}

            {hasVehicles ? (
                // --- EXISTING USER VIEW: List all vehicles ---
                vehicles.map((vehicle) => (
                    // Note: We use a View for the row wrapper, and the TouchableOpacity inside
                    <View style={styles.cardRow} key={vehicle.vehicle_id}>
                        <TouchableOpacity
                            style={styles.statusCard}
                            // Navigate using the specific vehicle ID
                            onPress={() => router.push(`/(app)/vehicle/${vehicle.vehicle_id}`)} 
                        >
                            <Ionicons name="car-sport-sharp" size={30} color="#3f51b5" />
                            <Text style={styles.cardTitle}>Assigned Vehicle</Text>
                            <Text style={styles.cardValue}>{vehicle.license_plate}</Text>
                            <Text style={styles.cardValue}>{vehicle.make_model}</Text>
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                // --- NEW USER VIEW: Onboarding Message ---
                <View style={styles.onboardingContainer}>
                    <Ionicons name="car-outline" size={80} color="#ccc" />
                    <Text style={styles.onboardingTitle}>No Vehicles Registered Yet</Text>
                    <Text style={styles.onboardingSubtitle}>
                        Your live tracking map and vehicles will appear here after registration.
                    </Text>
                </View>
            )}
            

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    // Styles for Loading/Error
    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: 200, // Ensure loading spinner is visible
    },
    loadingText: { 
        marginTop: 10, 
        fontSize: 16, 
        color: '#666' 
    },
    // Styles for Cards/Rows
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    statusCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        margin: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3f51b5',
    },
    // Styles for Onboarding View
    onboardingContainer: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    onboardingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
        color: '#333',
    },
    onboardingSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 5,
        color: '#666',
    },
    // The following styles were in your previous code but are not currently used in this version:
    // mapContainer: { height: 300, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', margin: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', },
    // mapPlaceholderText: { fontSize: 16, color: '#666', },
});