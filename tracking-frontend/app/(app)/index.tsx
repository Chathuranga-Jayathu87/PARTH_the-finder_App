import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getRegisteredVehicles } from '../../src/services/dataService'; 
import { useUser } from '../../src/context/UserContext'; // ⚡ යූසර්ගේ නම ගන්න Context එක ඉම්පෝට් කරා

// --- TYPE DEFINITIONS ---
interface Vehicle {
  license_plate: string;
  make_model: string;
  vehicle_id: string; 
}

export default function AppHome() {
  const { user } = useUser(); // 👤 Global state එකෙන් ලොග් වුණු යූසර්ව ගත්තා
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      const loadVehicles = async () => {
        setLoading(true);
        try {
          const userVehicles = await getRegisteredVehicles(); 
          // cast via unknown to avoid structural type mismatch between local Vehicle and imported one
          setVehicles(userVehicles as unknown as Vehicle[]);
        } catch (error) {
          console.error("Failed to load user vehicles:", error);
        } finally {
          setLoading(false);
        }
      };

      loadVehicles();
      return () => {}; 
    }, [])
  );

  const hasVehicles = vehicles.length > 0;

  // 🔄 LOADING VIEW (Screen එක මැදටම එන්න සකසා ඇත)
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3f51b5" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }
    
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
      {/* 1. Header/Welcome Area */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            Welcome Back, {user?.name || 'Driver'}!
          </Text>
          <Text style={styles.dateText}>JumboWatch Live Tracking Active</Text>
        </View>
        {/* <TouchableOpacity 
          style={styles.profileShortcut} 
          onPress={() => router.push('/(app)/settings')}
        >
          <Ionicons name="person-circle-outline" size={36} color="#3f51b5" />
        </TouchableOpacity> */}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      {/* 🚀 VEHICLE REGISTRATION BUTTON */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.registerCard}
          onPress={() => router.push('/(app)/register-vehicle')} 
          activeOpacity={0.8} 
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="add-circle" size={24} color="#fff" />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.registerCardTitle}>Register New Vehicle</Text>
            <Text style={styles.registerCardSubtitle}>Add a new vehicle to start tracking</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#3f51b5" />
        </TouchableOpacity>
      </View>

      {/* 🚀 VEHICLES LIST SECTION */}
      <Text style={styles.sectionTitle}>
        {hasVehicles ? 'Your Tracked Vehicles' : 'Status'}
      </Text>

      {hasVehicles ? (
        // --- EXISTING USER VIEW: Vertical List with Clean Vehicle Rows ---
        <View style={styles.listContainer}>
          {vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.vehicle_id}
              style={styles.vehicleCard}
              onPress={() => router.push(`/(app)/vehicle/${vehicle.vehicle_id}`)} 
              activeOpacity={0.7}
            >
              <View style={styles.vehicleIconWrapper}>
                <Ionicons name="car-sport" size={26} color="#3f51b5" />
              </View>
              
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleNumber}>{vehicle.license_plate}</Text>
                <Text style={styles.vehicleModel}>{vehicle.make_model}</Text>
              </View>

              <View style={styles.statusIndicator}>
                <Text style={styles.liveText}>LIVE</Text>
                <Ionicons name="chevron-forward" size={18} color="#888" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // --- NEW USER VIEW: Onboarding Message ---
        <View style={styles.onboardingContainer}>
          <View style={styles.alertIconBg}>
            <Ionicons name="car-outline" size={50} color="#888" />
          </View>
          <Text style={styles.onboardingTitle}>No Vehicles Registered Yet</Text>
          <Text style={styles.onboardingSubtitle}>
            Your live tracking map and assigned vehicles will appear here once you add a vehicle.
          </Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Layout layout එකේ background එකටම ගැලපෙන්න දැම්මා
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 15, 
    color: '#666',
    fontWeight: '500'
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f4',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  dateText: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  profileShortcut: {
    padding: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  actionRow: {
    paddingHorizontal: 20,
  },
  registerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eef0f5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 }
    }),
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#3f51b5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  registerCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  registerCardSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef0f5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 }
    }),
  },
  vehicleIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#edf0f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vehicleNumber: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  vehicleModel: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
    overflow: 'hidden',
  },
  onboardingContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eef0f5',
  },
  alertIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  onboardingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  onboardingSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    color: '#777',
    lineHeight: 18,
  },
});