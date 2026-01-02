// app/(app)/settings.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearAuthToken } from '@/src/services/authService'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; 

// --- SECTION DATA ---
const userSettings = [
    { id: '1', title: 'Update Profile', icon: 'person-outline', action: () => router.push('/(app)/profile/edit')},
    { id: '2', title: 'Change Password', icon: 'lock-closed-outline', action: () => router.push('/(app)/settings/change-password') },
    { id: '3', title: 'Two-Factor Authentication', icon: 'shield-checkmark-outline', action: () => Alert.alert('Security', 'Navigate to 2FA Setup') },
];


const aboutItems = [
    { id: '6', title: 'Privacy Policy', icon: 'document-text-outline', action: () => Alert.alert('Info', 'Open Privacy Policy link') },
    { id: '7', title: 'Terms of Service', icon: 'receipt-outline', action: () => Alert.alert('Info', 'Open Terms link') },
    // ⚠️ The Logout action is typically placed here or handled by the Drawer
    // { id: '8', title: 'Logout', icon: 'log-out-outline', action: handleLogout },
];

// --- SECTION COMPONENT ---
interface SettingsSectionProps {
    title: string;
    data: typeof userSettings;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, data }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map((item, index) => (
            <TouchableOpacity 
                key={item.id} 
                style={[
                    styles.itemContainer, 
                    index === data.length - 1 && styles.lastItem
                ]} 
                onPress={item.action}
            >
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color="#3f51b5" />
                <Text style={styles.itemText}>{item.title}</Text>
                <Ionicons name="chevron-forward-outline" size={18} color="#ccc" style={styles.arrowIcon} />
            </TouchableOpacity>
        ))}
    </View>
);

// --- SETTINGS SCREEN ---
export default function SettingsScreen() {
    
    // In a final app, the main Logout logic from CustomDrawerContent.js would be repeated here or called via context
     const handleLogout = async () => {
            await clearAuthToken();
         router.replace('/(auth)/Login');
     };


     const handleClearCache = async () => {
        try {
        // This clears all local storage except your auth token (if you want to keep them logged in)
        const keys = await AsyncStorage.getAllKeys();
        const filteredKeys = keys.filter(key => key !== 'userToken'); 
        await AsyncStorage.multiRemove(filteredKeys);
        
        Alert.alert('Success', 'App cache has been cleared.');
    } catch (error) {
        Alert.alert('Error', 'Failed to clear cache.');
    }

    }

    const appSettings = [
    { id: '4', title: 'Notification Preferences', icon: 'notifications-outline', action: () => Alert.alert('App', 'Navigate to Notification Settings') },
    { id: '5', title: 'Clear Cache', icon: 'trash-outline', action: () => Alert.alert('Clear Cache', 'Are you sure you want to clear the app cache?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => handleClearCache(), style: 'destructive' }
    ]), },
];



    return (
        <ScrollView style={styles.container}>
            <SettingsSection title="User & Security" data={userSettings} />
            <SettingsSection title="Application" data={appSettings} />
            <SettingsSection title="Legal & About" data={aboutItems} />
            
            {/* ⚠️ Logout Button can be added here as a separate, clearly styled button */}
            
            <TouchableOpacity 
  style={styles.logoutButton} 
  onPress={() => 
    Alert.alert(
      'Logout', 
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: () => handleLogout(), style: 'destructive' }
      ]
    )
  } 
>
  <Text style={styles.logoutText}>Log Out</Text>
</TouchableOpacity>

            <Text style={styles.versionText}>App Version 1.0.0</Text>
        </ScrollView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    section: {
        marginTop: 20,
        backgroundColor: '#fff',
        marginHorizontal: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 5,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
    arrowIcon: {
        marginLeft: 10,
    },
    logoutButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 10,
        marginTop: 30,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#999',
        marginTop: 20,
        marginBottom: 40,
    },
});