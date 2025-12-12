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
      </View>

        <View style={styles.cardRow}>
          <View style={styles.statusCard}>
            <Ionicons name="add-sharp" size={30} color="#3f51b5" />
            <Text style={styles.cardTitle}>Vehicle Registration</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.statusCard}>
            <Ionicons name="car-sport-sharp" size={30} color="#3f51b5" />
            <Text style={styles.cardTitle}>Assign Vehicle</Text>
            <Text style={styles.cardValue}>PBX-1578</Text>
            <Text style={styles.cardValue}>Toyota Hiace</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
});