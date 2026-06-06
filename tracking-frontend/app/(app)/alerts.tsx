import React, { useRef, useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { getAlerts, markAsRead } from '@/src/services/dataService';

/* ==============================
   TYPES
================================ */
interface AlertItem {
  alert_id: number;
  alert_type: string;
  message: string;
  license_plate: string;
  created_at: string;
}

/* ==============================
   ICON SELECTOR HELPER
================================ */
const getIcon = (type?: string) => {
  if (!type) {
    return { name: 'alert-circle-outline', color: '#9e9e9e' };
  }
  switch (type.toLowerCase()) {
    case 'sos':
      return { name: 'warning', color: '#f44336' };
    case 'overspeed':
      return { name: 'speedometer', color: '#ff5722' };
    case 'geofence':
      return { name: 'map', color: '#3f51b5' };
    case 'low_battery':
      return { name: 'battery-dead', color: '#ff9800' };
    case 'power_cut':
      return { name: 'flash', color: '#795548' };
    default:
      return { name: 'notifications', color: '#607d8b' };
  }
};

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const rowRefs = useRef<Map<string, Swipeable>>(new Map());
  const itemAnims = useRef<Map<string, Animated.Value>>(new Map());

  /* ==============================
     DATA FETCHING
  ================================ */
  const loadAlerts = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getAlerts();
      setAlerts(
        data.map((a: any) => ({
          ...a,
          alert_type: a.alert_type ?? 'UNKNOWN',
        }))
      );
    } catch (error: any) {
      if (error?.message?.includes('Authentication')) {
        router.replace('/(auth)/Login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

  const onRefresh = useCallback(() => {
    loadAlerts(true);
  }, []);

  /* ==============================
     SWIPE ACTIONS
  ================================ */
  const closeOthers = (id: string) => {
    rowRefs.current.forEach((ref, key) => {
      if (key !== id) ref?.close();
    });
  };

  const deleteItem = async (id: string, anim: Animated.Value) => {
    try {
      // ⚡ මුලින්ම ඇනිමේෂන් එක රන් කරනවා Native Driver එකෙන් (පට්ටම ස්මූත්)
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true, // 🚀 True කිරීමෙන් Performance බග් එක සම්පූර්ණයෙන්ම නැති කරා
      }).start(async () => {
        try {
          await markAsRead(parseInt(id));
          setAlerts((prev) => prev.filter((item) => item.alert_id.toString() !== id));
          rowRefs.current.delete(id);
          itemAnims.current.delete(id);
        } catch (err) {
          // බැක්එන්ඩ් එක ෆේල් වුණොත් අයිටම් එක ආපහු පේන්න අරිනවා
          Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
        }
      });
    } catch (error) {
      rowRefs.current.get(id)?.close();
    }
  };

  /* ==============================
     RENDER ROW
  ================================ */
  const renderItem = ({ item }: { item: AlertItem }) => {
    const idStr = item.alert_id.toString();
    const icon = getIcon(item.alert_type);

    if (!itemAnims.current.has(idStr)) {
      itemAnims.current.set(idStr, new Animated.Value(1));
    }
    const itemAnim = itemAnims.current.get(idStr)!;

    return (
      <Animated.View 
        style={{ 
          transform: [
            { scaleY: itemAnim },
            { scaleX: itemAnim } // 🪄 Scale X එකත් එකතු කරාම මැකීලා යද්දී පට්ටම Premium Effect එකක් එනවා
          ], 
          opacity: itemAnim,
        }}
      >
        <Swipeable
          ref={(ref) => { if (ref) rowRefs.current.set(idStr, ref); }}
          onSwipeableOpen={() => closeOthers(idStr)}
          overshootRight={false}
          renderRightActions={() => (
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => deleteItem(idStr, itemAnim)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={22} color="#fff" />
              <Text style={styles.deleteText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        >
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
              <Ionicons name={icon.name as any} size={22} color={icon.color} />
            </View>

            <View style={styles.content}>
              <View style={styles.rowTitleContainer}>
                <Text style={styles.title}>
                  {item.license_plate} • {item.alert_type.replace('_', ' ').toUpperCase()}
                </Text>
                {item.alert_type.toLowerCase() === 'sos' && (
                  <View style={styles.sosBadge}>
                    <Text style={styles.sosText}>CRITICAL</Text>
                  </View>
                )}
              </View>
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
              <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
            <Ionicons name="chevron-back" size={14} color="#ccc" style={{ marginLeft: 5 }} />
          </View>
        </Swipeable>
      </Animated.View>
    );
  };

  /* ==============================
     MAIN VIEW
  ================================ */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        
        {/* 1. Header Hint Container */}
        {alerts.length > 0 && (
          <View style={styles.hintContainer}>
            <Ionicons name="information-circle-outline" size={14} color="#3f51b5" style={{ marginRight: 5 }} />
            <Text style={styles.hintText}>
              Swipe left on any alert to dismiss it
            </Text>
          </View>
        )}

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3f51b5" />
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.alert_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3f51b5']} tintColor="#3f51b5" />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIconBg}>
                  <Ionicons name="notifications-off-outline" size={45} color="#888" />
                </View>
                <Text style={styles.emptyText}>No alerts found</Text>
                <Text style={styles.emptySubText}>You are all caught up!</Text>
              </View>
            }
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  hintContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#edf0f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f5'
  },
  hintText: {
    fontSize: 12,
    color: '#3f51b5',
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef0f5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: { flex: 1 },
  rowTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontWeight: '700', fontSize: 13, color: '#1a1a1a', flex: 1 },
  sosBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sosText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  message: { fontSize: 13, color: '#555', marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, color: '#999', marginTop: 8 },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eef0f5'
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  emptySubText: {
    marginTop: 6,
    fontSize: 14,
    color: '#777',
  },

  deleteBtn: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 85,
    borderRadius: 14,
    marginBottom: 12,
    marginLeft: 10,
  },
  deleteText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
});