// app/(app)/alerts.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator,TouchableOpacity, Alert as RNAlert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import moment from 'moment'; // 🚀 Recommended: Install moment or date-fns for easy date formatting
// npm install moment 

// --- TYPE DEFINITIONS ---
interface AlertData {
    id: string;
    type: 'speeding' | 'ignition_on' | 'ignition_off' | 'geofence_out' | 'low_battery';
    timestamp: string; // ISO string format
    vehiclePlate: string;
    details: string; // Specific details like speed (120 km/h) or geofence name
    isRead: boolean;
}

// --- MOCK DATA ---
const mockAlerts: AlertData[] = [
    { id: '1', type: 'speeding', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), vehiclePlate: 'PBX-1578', details: 'Speed exceeded 100 km/h (actual: 125 km/h)', isRead: false },
    { id: '2', type: 'ignition_on', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), vehiclePlate: 'PBX-1578', details: 'Engine started at Colombo Port.', isRead: false },
    { id: '3', type: 'geofence_out', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), vehiclePlate: 'CBB-2001', details: 'Exited "Delivery Zone A"', isRead: true },
    { id: '4', type: 'ignition_off', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), vehiclePlate: 'PBX-1578', details: 'Engine stopped near Kandy.', isRead: true },
    { id: '5', type: 'low_battery', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), vehiclePlate: 'CBB-2001', details: 'Device battery level is critical (5%).', isRead: true },
];

// --- HELPER FUNCTION ---
const getAlertIcon = (type: AlertData['type']) => {
    switch (type) {
        case 'speeding': return { name: 'flash', color: '#FF3B30' }; // Red
        case 'ignition_on': return { name: 'power', color: '#4CAF50' }; // Green
        case 'ignition_off': return { name: 'power', color: '#FF5722' }; // Orange
        case 'geofence_out': return { name: 'alert-circle', color: '#3f51b5' }; // Blue
        case 'low_battery': return { name: 'battery-half', color: '#FFC107' }; // Yellow
        default: return { name: 'notifications', color: '#333' };
    }
};

// --- ALERT LIST ITEM ---
const AlertItem: React.FC<{ alert: AlertData }> = ({ alert }) => {
    const { name, color } = getAlertIcon(alert.type);

    // Functionality to mark as read would go here (API call)
    const handlePress = () => {
        // 💡 TODO: Add API call to mark alert as read
        RNAlert.alert("Alert Details", alert.details);
    };

    return (
        <TouchableOpacity style={[styles.itemContainer, !alert.isRead && styles.unreadContainer]} onPress={handlePress}>
            <Ionicons name={name} size={24} color={color} style={styles.itemIcon} />
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{alert.vehiclePlate} - {alert.type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.itemDetail} numberOfLines={1}>{alert.details}</Text>
                <Text style={styles.itemTime}>{moment(alert.timestamp).fromNow()}</Text>
            </View>
            {!alert.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
};


// --- ALERTS SCREEN ---
export default function AlertsScreen() {
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            // 💡 Replace MOCK with API call: 
            // const response = await fetchAlertsApi(); // Query /api/alerts?userId=X
            
            // Simulating API latency
            await new Promise(resolve => setTimeout(resolve, 800));
            setAlerts(mockAlerts);

        } catch (error) {
            console.error("Failed to fetch alerts:", error);
            RNAlert.alert("Error", "Could not load alerts from the server.");
        } finally {
            setLoading(false);
        }
    };
    
    // Use useFocusEffect to refresh data every time the screen becomes active
    useFocusEffect(
        React.useCallback(() => {
            fetchAlerts();
            // Optional: Set up a timer to refresh the alerts list every 30 seconds
            const interval = setInterval(fetchAlerts, 30000); 
            return () => clearInterval(interval); // Cleanup interval
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3f51b5" />
                <Text style={styles.loadingText}>Loading Alerts...</Text>
            </View>
        );
    }
    
    if (alerts.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                <Text style={styles.loadingText}>No new alerts found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AlertItem alert={item} />}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
    );
}


// --- STYLES ---

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    list: {
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: '#f5f5f5',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    unreadContainer: {
        backgroundColor: '#e6f7ff', // Light blue background for unread alerts
        borderLeftWidth: 4,
        borderLeftColor: '#3f51b5',
    },
    itemIcon: {
        marginRight: 15,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    itemDetail: {
        fontSize: 12,
        color: '#666',
    },
    itemTime: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30', // Red dot for unread
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: 'transparent', // Separation provided by marginVertical on itemContainer
    },
});