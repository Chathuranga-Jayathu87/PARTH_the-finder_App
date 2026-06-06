import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNotificationSettings, updateNotificationSetting } from '../../../src/services/userService';

/* ================= TYPES ================= */
interface PreferenceItemProps {
    id: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    description: string;
    value: boolean;
    onToggle: (id: string, currentValue: boolean) => void;
    color?: string;
}

/* ================= OPTIMIZED COMPONENT ================= */
// React.memo භාවිතයෙන් අදාළ ස්විච් එකේ අගය වෙනස් වුණොත් විතරක් රෙන්ඩර් වෙන්න සැලැස්වීම
const PreferenceItem = memo(({ id, icon, title, description, value, onToggle, color = "#3f51b5" }: PreferenceItemProps) => {
    PreferenceItem.displayName = 'PreferenceItem';
    // console.log(`Rendering: ${title}`); // 👈 පර්ෆෝමන්ස් ටෙස්ට් කරලා බලන්න පුළුවන් දැන් රෙන්ඩර් වෙන්නේ එකයි
    
    return (
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
                ios_backgroundColor="#D1D1D1" // iOS එකේ බැක්ග්‍රවුන්ඩ් එක ලස්සන කරන්න
                onValueChange={() => onToggle(id, value)}
                value={value}
            />
        </View>
    );
}, (prevProps, nextProps) => {
    // අගයන් දෙක සමාන නම් රී-රෙන්ඩර් කරන්නේ නැහැ
    return prevProps.value === nextProps.value && prevProps.color === nextProps.color;
});

/* ================= MAIN SCREEN ================= */
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
            if (res.success && res.settings && typeof res.settings === 'object') {
                const s = res.settings as Record<string, any>;
                setSettings({
                    overspeed_alerts: !!s.speed_alerts,
                    geofence_alerts: !!s.geofence_alerts,
                    low_battery_alerts: !!s.low_battery_alerts,
                    power_cut_alerts: !!s.power_cut_alerts,
                    sos_alerts: !!s.sos_alerts,
                    vibration_alerts: !!s.vibration_alerts,
                });
            } else {
                throw new Error("Invalid response structure");
            }
        } catch (error) {
            console.error("Load settings error:", error);
            Alert.alert("Error", "Failed to load notification settings.");
        } finally {
            setLoading(false);
        }
    };

    // useCallback භාවිතයෙන් ෆන්ක්ෂන් එක හැම පාරම අලුතින් ක්‍රියේට් වීම වැළැක්වීම
    const handleToggle = useCallback(async (key: string, currentValue: boolean) => {
        const newValue = !currentValue;
        
        // Optimistic UI Update
        setSettings(prev => ({ ...prev, [key]: newValue }));

        try {
            const res = await updateNotificationSetting(key, newValue);
            if (!res.success) throw new Error();
        } catch (error) {
            // API එක ෆේල් වුණොත් පරණ අගයට රිවර්ට් කිරීම
            setSettings(prev => ({ ...prev, [key]: currentValue }));
            Alert.alert("Error", "Could not save preference. Check your connection.");
        }
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3f51b5" />
            </View>
        );
    }

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.scrollContent} // 👈 යටින් පෑඩින් එකක් දෙන්න
            showsVerticalScrollIndicator={false}
        >
            <Text style={styles.sectionTitle}>Safety & Security</Text>
            <View style={styles.section}>
                <PreferenceItem 
                    id="overspeed_alerts"
                    icon="speedometer-outline"
                    title="Speeding Alerts"
                    description="Notify when vehicle exceeds limit"
                    value={settings.overspeed_alerts}
                    onToggle={handleToggle}
                />
                <PreferenceItem 
                    id="geofence_alerts"
                    icon="map-outline"
                    title="Geo-fence"
                    description="Arrival or departure from zones"
                    value={settings.geofence_alerts}
                    onToggle={handleToggle}
                />
            </View>

            <Text style={styles.sectionTitle}>Device Health</Text>
            <View style={styles.section}>
                <PreferenceItem 
                    id="low_battery_alerts"
                    icon="battery-dead-outline"
                    title="Low Battery"
                    description="Alert when internal battery is low"
                    value={settings.low_battery_alerts}
                    color="#FF9500"
                    onToggle={handleToggle}
                />
                <PreferenceItem 
                    id="vibration_alerts"
                    icon="pulse-outline"
                    title="Vibration Alerts"
                    description="Alert when device is shaken or moved"
                    value={settings.vibration_alerts}
                    color="#FF9500"
                    onToggle={handleToggle}
                />
            </View>

            <Text style={styles.sectionTitle}>Device RED Alerts</Text>
            <View style={styles.section}>
                <PreferenceItem 
                    id="sos_alerts"
                    icon="alert-circle-outline"
                    title="SOS Alerts"
                    description="Alert when SOS button is pressed"
                    value={settings.sos_alerts}
                    color="#FF3B30"
                    onToggle={handleToggle}
                />
                <PreferenceItem 
                    id="power_cut_alerts"
                    icon="flash-outline"
                    title="Power Disconnect"
                    description="Alert if tracker power is removed"
                    value={settings.power_cut_alerts}
                    color="#FF3B30"
                    onToggle={handleToggle}
                />
            </View>
        </ScrollView>
    );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f7' }, // 🍏 iOS ස්ටෑන්ඩර්ඩ් ලයිට් බැක්ග්‍රවුන්ඩ් එක
    scrollContent: { paddingBottom: Platform.OS === 'ios' ? 40 : 20 }, // යටම බෝඩරයට හිරවීම වැළැක්වීමට
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f7' },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6e6e73', paddingHorizontal: 16, marginTop: 22, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
    section: { backgroundColor: '#fff', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#c6c6c8', overflow: 'hidden' },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingRight: 16, borderBottomWidth: 0.5, borderBottomColor: '#e5e5ea', marginLeft: 16 },
    iconContainer: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    textContainer: { flex: 1, paddingRight: 8 },
    itemTitle: { fontSize: 16, fontWeight: '400', color: '#000' },
    itemDescription: { fontSize: 13, color: '#8e8e93', marginTop: 2 },
});