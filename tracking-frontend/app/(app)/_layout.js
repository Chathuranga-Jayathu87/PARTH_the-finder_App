// app/(app)/_layout.js
import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import CustomDrawerContent from '../../components/CustomDrawerContent'; // We'll create this next

export default function DrawerLayout() {
  return (
    <Drawer 
      screenOptions={{
        headerTintColor: '#3f51b5', // Color of header text/icons
        drawerActiveTintColor: '#3f51b5', // Color for active link in sidebar
      }}
      // Use the custom content component for the full sidebar UI
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* This screen is the default route when navigating to '/(app)' 
        It will be your main map/dashboard.
      */}
      <Drawer.Screen
        name="index" // Corresponds to app/(app)/index.js
        options={{
          title: 'Live Map Dashboard',
          drawerLabel: 'Dashboard',
          headerTitle: 'Live Tracker',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />

      {/* Placeholder for future screens linked in the sidebar */}
      <Drawer.Screen
        name="alerts" // Corresponds to app/(app)/alerts.js (you will create this)
        options={{
          title: 'Alerts & Events',
          drawerLabel: 'Alerts',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}