// // app/(app)/alerts.tsx

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAlerts, markAsRead } from '../../src/services/dataService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% of screen = full swipe delete

/* ==============================
   TYPE (MATCHES BACKEND RESPONSE)
================================ */
interface AlertItem {
  alert_id: number;
  alert_type: string;
  message: string;
  license_plate: string;
  created_at: string;
  lat?: string;
  lng?: string;
}

/* ==============================
   SCREEN
================================ */
export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Store refs for each swipeable item
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());

  // 🔄 Reload alerts when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadAlerts = async () => {
        setLoading(true);
        try {
          const data = await getAlerts();
          const normalized: AlertItem[] = data.map((a: any) => ({
            ...a,
            alert_type: a.alert_type ?? 'UNKNOWN',
          }));
          setAlerts(normalized);
        } catch (error: any) {
          if (error?.message?.includes('Authentication')) {
            router.replace('/(auth)/Login');
          } else {
            console.error('Alerts load error:', error);
          }
        } finally {
          setLoading(false);
        }
      };
      loadAlerts();
    }, [])
  );

  // Dismiss single Alert
  const handleDismiss = async (alertId: number) => {
    try {
      await markAsRead(alertId);
      // Close the swipeable first
      swipeableRefs.current.get(alertId)?.close();
      // Remove the read alert from the list
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.alert_id !== alertId)
      );
      // Clean up ref
      swipeableRefs.current.delete(alertId);
    } catch (error) {
      Alert.alert('Error', 'Failed to dismiss alert.');
    }
  };

  // --- RENDER RIGHT ACTION (The Delete Button) ---
  const renderRightActions = (
    id: number,
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Scale animation for the button
    const scale = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.8, 0],
      extrapolate: 'clamp',
    });

    // Opacity for "Release to delete" indicator
    const deleteOpacity = dragX.interpolate({
      inputRange: [-SCREEN_WIDTH, -SWIPE_THRESHOLD, -SWIPE_THRESHOLD + 1],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
    });

    // Background color changes when full swipe is reached
    const backgroundColor = dragX.interpolate({
      inputRange: [-SCREEN_WIDTH, -SWIPE_THRESHOLD, -SWIPE_THRESHOLD + 1, 0],
      outputRange: ['#FF3B30', '#FF3B30', '#FF6B60', '#FF6B60'],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.deleteContainer, 
          { backgroundColor }
        ]}
      >
        <TouchableOpacity 
          onPress={() => handleDismiss(id)} 
          activeOpacity={0.6}
          style={styles.deleteButton}
        >
          <Animated.View style={[styles.deleteContent, { transform: [{ scale }] }]}>
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteText}>Dismiss</Text>
          </Animated.View>
          
          {/* "Release to delete" indicator */}
          <Animated.View style={[styles.releaseIndicator, { opacity: deleteOpacity }]}>
            <Ionicons name="arrow-back" size={18} color="white" />
            <Text style={styles.releaseText}>Release to delete</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ICON HANDLER (SAFE)
  const getIcon = (type?: string) => {
    if (!type) {
      return { name: 'alert-circle-outline', color: '#9e9e9e' };
    }

    switch (type.toLowerCase()) {
      case 'sos':
        return { name: 'warning-outline', color: '#f44336' };
      case 'overspeed':
        return { name: 'speedometer-outline', color: '#ff5722' };
      case 'geofence':
        return { name: 'map-outline', color: '#3f51b5' };
      case 'low_battery':
        return { name: 'battery-dead-outline', color: '#ff9800' };
      case 'power_cut':
        return { name: 'flash-outline', color: '#795548' };
      default:
        return { name: 'notifications-outline', color: '#607d8b' };
    }
  };

  const renderItem = ({ item }: { item: AlertItem }) => {
    const icon = getIcon(item.alert_type);

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current.set(item.alert_id, ref);
          }
        }}
        renderRightActions={(progress, dragX) =>
          renderRightActions(item.alert_id, progress, dragX)
        }
        // KEY SETTINGS FOR SWIPE BEHAVIOR:
        rightThreshold={40}              // 👈 Low threshold to OPEN the button easily
        friction={2}                      // 👈 Controls swipe resistance
        overshootRight={false}            // 👈 Prevents overshoot past the button
        overshootFriction={8}             // 👈 Extra friction at the end
        
        // 🎯 THIS IS THE MAGIC - Full swipe triggers delete
        onSwipeableWillOpen={(direction) => {
          // Only trigger on intentional full swipe
          if (direction === 'right') {
            // Short delay to let animation complete
            setTimeout(() => {
              handleDismiss(item.alert_id);
            }, 100);
          }
        }}
      >
        <View style={styles.alertCard}>
          <Ionicons
            name={icon.name as any}
            size={26}
            color={icon.color}
            style={styles.icon}
          />
          <View style={styles.textDetails}>
            <Text style={styles.alertTitle}>
              {item.license_plate} • {item.alert_type.replace('_', ' ')}
            </Text>
            <Text style={styles.alertMessage}>{item.message}</Text>
            <Text style={styles.alertTime}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
          
          {/* Swipe hint indicator */}
          <Ionicons name="chevron-back" size={18} color="#ccc" />
        </View>
      </Swipeable>
    );
  };

  /* ==============================
     LOADING STATE
  ================================ */
  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3f51b5" />
        </View>
      </GestureHandlerRootView>
    );
  }

  /* ==============================
     MAIN VIEW
  ================================ */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header hint */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            ← Swipe left to dismiss alerts
          </Text>
        </View>
        
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.alert_id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="notifications-off-outline"
                size={50}
                color="#ccc"
              />
              <Text style={styles.emptyText}>No alerts found</Text>
            </View>
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}

/* ==============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e8eaf6',
  },
  hintText: {
    fontSize: 12,
    color: '#5c6bc0',
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  icon: {
    marginRight: 14,
  },
  textDetails: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textTransform: 'uppercase',
  },
  alertMessage: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
  },
  alertTime: {
    fontSize: 11,
    color: '#999',
  },
  empty: {
    alignItems: 'center',
    marginTop: 120,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  // Delete button styles
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 10,
    marginRight: 10,
    borderRadius: 10,
    minWidth: 100,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: '100%',
    minWidth: 100,
  },
  deleteContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 12,
  },
  releaseIndicator: {
    position: 'absolute',
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  releaseText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
});