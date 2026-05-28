import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotificationSettings, updateNotificationSetting } from '@/src/services/userService';

const PreferenceItem = ({ icon, title, description, value, onToggle, color = "#3f51b5" }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; description: string; value: boolean; onToggle: (value: boolean) => void; color?: string }) => (
    <View style={styles.item}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            <Text style={styles.itemDescription}>{description}</Text>
        </View>
        <Switch 
            trackColor={{ false: "#D1D1D1", true: color }}
            thumbColor="#fff"
            onValueChange={onToggle}
            value={value}
        />
    </View>
);

export default function NotificationPreferences() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        overspeed_alerts: false,
        geofence_alerts: false,
        low_battery_alerts: false,
        power_cut_alerts: false,
        sos_alerts: false,
        vibration_alerts: false,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
    try {
        const res = await getNotificationSettings();
        console.log("Notification settings response:", res);

        if (res.success && res.settings) {
            setSettings({
                overspeed_alerts: !!res.settings.speed_alerts,
                geofence_alerts: !!res.settings.geofence_alerts,
                low_battery_alerts: !!res.settings.low_battery_alerts,
                power_cut_alerts: !!res.settings.power_cut_alerts,
                sos_alerts: !!res.settings.sos_alerts,
                vibration_alerts: !!res.settings.vibration_alerts,
            });
        } else {
            throw new Error("Invalid response structure");
        }
    } catch (error) {
        console.log("Load settings error:", error);
        Alert.alert("Error", "Failed to load notification settings.");
    } finally {
        setLoading(false);
    }
};

    const handleToggle = async (key: string, currentValue: boolean) => {
        const newValue = !currentValue;
        // Optimistic UI Update (Change UI immediately)
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const res = await updateNotificationSetting(key, newValue);
            if (!res.success) throw new Error();
        } catch (error) {
            // Revert if API fails
            setSettings(prev => ({ ...prev, [key]: currentValue }));
            Alert.alert("Error", "Could not save preference. Check your connection.");
        }
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#3f51b5" /></View>;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionTitle}>Safety & Security</Text>
            <View style={styles.section}>
                <PreferenceItem 
                    icon="speedometer-outline"
                    title="Speeding Alerts"
                    description="Notify when vehicle exceeds limit"
                    value={settings.overspeed_alerts}
                    onToggle={() => handleToggle('overspeed_alerts', settings.overspeed_alerts)}
                />
                <PreferenceItem 
                    icon="map-outline"
                    title="Geo-fence"
                    description="Arrival or departure from zones"
                    value={settings.geofence_alerts}
                    onToggle={() => handleToggle('geofence_alerts', settings.geofence_alerts)}
                />
            </View>

            <Text style={styles.sectionTitle}>Device Health</Text>
            <View style={styles.section}>
                <PreferenceItem 
                    icon="battery-dead-outline"
                    title="Low Battery"
                    description="Alert when internal battery is low"
                    value={settings.low_battery_alerts}
                    color="#FF9500"
                    onToggle={() => handleToggle('low_battery_alerts', settings.low_battery_alerts)}
                />
               
                <PreferenceItem 
                    icon="pulse-outline"
                    title="Vibration Alerts"
                    description="Alert when device is shaken or moved"
                    value={settings.vibration_alerts}
                    color="#FF9500"
                    onToggle={() => handleToggle('vibration_alerts', settings.vibration_alerts)}
                />
               
            </View>
            <Text style={styles.sectionTitle}>Device RED Alerts</Text>
                <View style={styles.section}>
                <PreferenceItem 
                    icon="alert-circle-outline"
                    title="SOS Alerts"
                    description="Alert when SOS button is pressed"
                    value={settings.sos_alerts}
                    color="#FF3B30"
                    onToggle={() => handleToggle('sos_alerts', settings.sos_alerts)}
                />
               
                 <PreferenceItem 
                    icon="flash-outline"
                    title="Power Disconnect"
                    description="Alert if tracker power is removed"
                    value={settings.power_cut_alerts}
                    color="#FF3B30"
                    onToggle={() => handleToggle('power_cut_alerts', settings.power_cut_alerts)}
                />
                </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#8e8e93', marginHorizontal: 20, marginTop: 25, marginBottom: 10, textTransform: 'uppercase' },
    section: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#efeff4' },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f2f2f7', marginLeft: 15, paddingLeft: 0 },
    iconContainer: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    textContainer: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '500', color: '#1c1c1e' },
    itemDescription: { fontSize: 13, color: '#8e8e93', marginTop: 2 },
});