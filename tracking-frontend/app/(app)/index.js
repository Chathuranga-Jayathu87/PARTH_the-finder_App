// app/(app)/index.js - The main Home Screen/Dashboard

import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppHome() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      
      {/* 1. Header/Welcome Area */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back, User!</Text>
        <Button 
          title="Open Menu" 
          onPress={() => navigation.openDrawer()} // Button to open the sidebar
          color="#3f51b5"
        />
      </View>

      {/* 2. Main Map View Area (Placeholder for react-native-maps) */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapPlaceholderText}>
          
          {/* This is where you will integrate react-native-maps 
            to show real-time vehicle location.
          */}
          MAP VIEW LOADING...
        </Text>
        <Ionicons name="location-sharp" size={40} color="#FF3B30" style={{ marginTop: 10 }} />
      </View>

      {/* 3. Status Cards / Summary */}
      <View style={styles.cardRow}>
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Vehicle Status</Text>
          <Text style={styles.cardValue}>ONLINE</Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Last Update</Text>
          <Text style={styles.cardValue}>Just Now</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Alerts Today</Text>
          <Text style={styles.cardValue}>3</Text>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Distance Today</Text>
          <Text style={styles.cardValue}>150 km</Text>
        </View>
      </View>
      
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
  mapContainer: {
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
});