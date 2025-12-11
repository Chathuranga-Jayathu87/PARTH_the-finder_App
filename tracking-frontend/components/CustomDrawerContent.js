// components/CustomDrawerContent.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { router } from 'expo-router';

export default function CustomDrawerContent(props) {
  
  const handleLogout = () => {
    // 1. Clear AsyncStorage (token)
    // AsyncStorage.removeItem('token'); 
    
    // 2. Redirect to the login screen
    router.replace('/(auth)/Login');
  };

  return (
    <View style={styles.container}>
      {/* Drawer Header Area (Logo/User Info) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GPS Tracker</Text>
        <Text style={styles.headerSubtitle}>User: {props.userEmail || 'test@user.com'}</Text>
      </View>
      
      {/* The standard list of links defined in app/(app)/_layout.js */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      {/* Logout Button at the bottom */}
      <View style={styles.footer}>
        <Button 
          title="Logout" 
          onPress={handleLogout} 
          color="#FF3B30"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    backgroundColor: '#f6f6f6',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3f51b5',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});