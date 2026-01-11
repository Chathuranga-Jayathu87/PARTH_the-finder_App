// // app/(app)/alerts.tsx

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator,TouchableOpacity, Alert as RNAlert } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useFocusEffect } from 'expo-router';
// import moment from 'moment'; // 🚀 Recommended: Install moment or date-fns for easy date formatting
// // npm install moment 

// // --- TYPE DEFINITIONS ---
// interface AlertData {
//     id: string;
//     type: 'speeding' | 'ignition_on' | 'ignition_off' | 'geofence_out' | 'low_battery';
//     timestamp: string; // ISO string format
//     vehiclePlate: string;
//     details: string; // Specific details like speed (120 km/h) or geofence name
//     isRead: boolean;
// }

// // --- MOCK DATA ---
// const mockAlerts: AlertData[] = [
//     { id: '1', type: 'speeding', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), vehiclePlate: 'PBX-1578', details: 'Speed exceeded 100 km/h (actual: 125 km/h)', isRead: false },
//     { id: '2', type: 'ignition_on', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), vehiclePlate: 'PBX-1578', details: 'Engine started at Colombo Port.', isRead: false },
//     { id: '3', type: 'geofence_out', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), vehiclePlate: 'CBB-2001', details: 'Exited "Delivery Zone A"', isRead: true },
//     { id: '4', type: 'ignition_off', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), vehiclePlate: 'PBX-1578', details: 'Engine stopped near Kandy.', isRead: true },
//     { id: '5', type: 'low_battery', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), vehiclePlate: 'CBB-2001', details: 'Device battery level is critical (5%).', isRead: true },
// ];

// // --- HELPER FUNCTION ---
// const getAlertIcon = (type: AlertData['type']) => {
//     switch (type) {
//         case 'speeding': return { name: 'flash', color: '#FF3B30' }; // Red
//         case 'ignition_on': return { name: 'power', color: '#4CAF50' }; // Green
//         case 'ignition_off': return { name: 'power', color: '#FF5722' }; // Orange
//         case 'geofence_out': return { name: 'alert-circle', color: '#3f51b5' }; // Blue
//         case 'low_battery': return { name: 'battery-half', color: '#FFC107' }; // Yellow
//         default: return { name: 'notifications', color: '#333' };
//     }
// };

// // --- ALERT LIST ITEM ---
// const AlertItem: React.FC<{ alert: AlertData }> = ({ alert }) => {
//     const { name, color } = getAlertIcon(alert.type);

//     // Functionality to mark as read would go here (API call)
//     const handlePress = () => {
//         // 💡 TODO: Add API call to mark alert as read
//         RNAlert.alert("Alert Details", alert.details);
//     };

//     return (
//         <TouchableOpacity style={[styles.itemContainer, !alert.isRead && styles.unreadContainer]} onPress={handlePress}>
//             <Ionicons name={name} size={24} color={color} style={styles.itemIcon} />
//             <View style={styles.itemContent}>
//                 <Text style={styles.itemTitle}>{alert.vehiclePlate} - {alert.type.replace('_', ' ').toUpperCase()}</Text>
//                 <Text style={styles.itemDetail} numberOfLines={1}>{alert.details}</Text>
//                 <Text style={styles.itemTime}>{moment(alert.timestamp).fromNow()}</Text>
//             </View>
//             {!alert.isRead && <View style={styles.unreadDot} />}
//         </TouchableOpacity>
//     );
// };


// // --- ALERTS SCREEN ---
// export default function AlertsScreen() {
//     const [alerts, setAlerts] = useState<AlertData[]>([]);
//     const [loading, setLoading] = useState(false);

//     const fetchAlerts = async () => {
//         setLoading(true);
//         try {
//             // 💡 Replace MOCK with API call: 
//             // const response = await fetchAlertsApi(); // Query /api/alerts?userId=X
            
//             // Simulating API latency
//             await new Promise(resolve => setTimeout(resolve, 800));
//             setAlerts(mockAlerts);

//         } catch (error) {
//             console.error("Failed to fetch alerts:", error);
//             RNAlert.alert("Error", "Could not load alerts from the server.");
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     // Use useFocusEffect to refresh data every time the screen becomes active
//     useFocusEffect(
//         React.useCallback(() => {
//             fetchAlerts();
//             // Optional: Set up a timer to refresh the alerts list every 30 seconds
//             const interval = setInterval(fetchAlerts, 30000); 
//             return () => clearInterval(interval); // Cleanup interval
//         }, [])
//     );

//     if (loading) {
//         return (
//             <View style={styles.centerContainer}>
//                 <ActivityIndicator size="large" color="#3f51b5" />
//                 <Text style={styles.loadingText}>Loading Alerts...</Text>
//             </View>
//         );
//     }
    
//     if (alerts.length === 0) {
//         return (
//             <View style={styles.centerContainer}>
//                 <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
//                 <Text style={styles.loadingText}>No new alerts found.</Text>
//             </View>
//         );
//     }

//     return (
//         <FlatList
//             data={alerts}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => <AlertItem alert={item} />}
//             contentContainerStyle={styles.list}
//             ItemSeparatorComponent={() => <View style={styles.separator} />}
//         />
//     );
// }


// // --- STYLES ---

// const styles = StyleSheet.create({
//     centerContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#f5f5f5',
//     },
//     loadingText: {
//         marginTop: 10,
//         fontSize: 16,
//         color: '#666',
//     },
//     list: {
//         paddingHorizontal: 10,
//         paddingTop: 10,
//         backgroundColor: '#f5f5f5',
//     },
//     itemContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         padding: 15,
//         borderRadius: 8,
//         marginVertical: 5,
//         shadowColor: '#000',
//         shadowOpacity: 0.05,
//         shadowRadius: 3,
//         elevation: 1,
//     },
//     unreadContainer: {
//         backgroundColor: '#e6f7ff', // Light blue background for unread alerts
//         borderLeftWidth: 4,
//         borderLeftColor: '#3f51b5',
//     },
//     itemIcon: {
//         marginRight: 15,
//     },
//     itemContent: {
//         flex: 1,
//     },
//     itemTitle: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 3,
//     },
//     itemDetail: {
//         fontSize: 12,
//         color: '#666',
//     },
//     itemTime: {
//         fontSize: 10,
//         color: '#999',
//         marginTop: 5,
//     },
//     unreadDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         backgroundColor: '#FF3B30', // Red dot for unread
//         marginLeft: 10,
//     },
//     separator: {
//         height: 1,
//         backgroundColor: 'transparent', // Separation provided by marginVertical on itemContainer
//     },
// });





// import React, { useState, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
// import { useFocusEffect, router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { getAlerts } from '../../src/services/dataService';

// // --- TYPE DEFINITION ---
// interface AlertItem {
//     id: string;
//     type: string;
//     message: string;
//     plate: string;
//     created_at: string;
// }

// export default function AlertsScreen() {
//     const [alerts, setAlerts] = useState<AlertItem[]>([]);
//     const [loading, setLoading] = useState(true);

//     // 🚀 Refresh alerts every time screen is focused
//     useFocusEffect(
//         useCallback(() => {
//             const loadAlerts = async () => {
//                 setLoading(true);
//                 try {
//                     const data = await getAlerts();
//                     setAlerts(data);
//                 } catch (error: any) {
//                     if (error.message.includes('Authentication')) {
//                         router.replace('/(auth)/Login');
//                     } else {
//                         console.error("Alerts load error:", error);
//                     }
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             loadAlerts();
//         }, [])
//     );

//     const getIcon = (type: string) => {
//         switch (type.toLowerCase()) {
//             case 'speeding': return { name: 'speedometer', color: '#f44336' };
//             case 'ignition_on': return { name: 'key', color: '#4CAF50' };
//             case 'ignition_off': return { name: 'power', color: '#FF9800' };
//             default: return { name: 'notifications', color: '#3f51b5' };
//         }
//     };

//     const renderItem = ({ item }: { item: AlertItem }) => {
//         const icon = getIcon(item.type);
//         return (
//             <View style={styles.alertCard}>
//                 <Ionicons name={icon.name as any} size={24} color={icon.color} style={styles.icon} />
//                 <View style={styles.textDetails}>
//                     <Text style={styles.alertTitle}>{item.plate} - {item.type.replace('_', ' ')}</Text>
//                     <Text style={styles.alertMessage}>{item.message}</Text>
//                     <Text style={styles.alertTime}>{new Date(item.created_at).toLocaleString()}</Text>
//                 </View>
//             </View>
//         );
//     };

//     if (loading) {
//         return (
//             <View style={styles.center}>
//                 <ActivityIndicator size="large" color="#3f51b5" />
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={alerts}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderItem}
//                 ListEmptyComponent={
//                     <View style={styles.empty}>
//                         <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
//                         <Text style={styles.emptyText}>No alerts found</Text>
//                     </View>
//                 }
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f5f5f5' },
//     center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     alertCard: {
//         flexDirection: 'row',
//         backgroundColor: '#fff',
//         padding: 15,
//         marginHorizontal: 10,
//         marginTop: 10,
//         borderRadius: 8,
//         elevation: 2,
//         alignItems: 'center'
//     },
//     icon: { marginRight: 15 },
//     textDetails: { flex: 1 },
//     alertTitle: { fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', color: '#333' },
//     alertMessage: { fontSize: 13, color: '#666', marginVertical: 2 },
//     alertTime: { fontSize: 11, color: '#999' },
//     empty: { alignItems: 'center', marginTop: 100 },
//     emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
// });















import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,TouchableOpacity, Alert,
  Animated
} from 'react-native';
import { GestureHandlerRootView,Swipeable,SwipeableProps  } from 'react-native-gesture-handler';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAlerts, markAsRead } from '../../src/services/dataService';

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

  // 🔄 Reload alerts when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadAlerts = async () => {
  setLoading(true);
  try {
    const data = await getAlerts(); // <-- this is an ARRAY

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

  //useFocusEffect(useCallback(() => { loadAlerts(); }, []));

//Dismiss single Alert
const handleDismiss = async (alertId: number) => {
    try {
      await markAsRead(alertId);
      //Remove the read alert from the list
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.alert_id !== alertId)
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to dismiss alert.');
    }

  };

  // --- RENDER RIGHT ACTION (The Delete Button) ---
  const renderRightActions = (id: number, progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  
  return (
      <TouchableOpacity onPress={() => handleDismiss(id)} activeOpacity={0.6}>
        <View style={styles.deleteBox}>
          <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
            Dismiss
          </Animated.Text>
          <Ionicons name="trash-outline" size={24} color="white" />
        </View>
      </TouchableOpacity>
    );
  
  
  }

 //    ICON HANDLER (SAFE)

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

  /* ==============================
     RENDER ITEM
  ================================ */
  const renderItem = ({ item }: { item: AlertItem }) => {
    const icon = getIcon(item.alert_type);

    return (
      // <View style={styles.alertCard}>
      //   <Ionicons
      //     name={icon.name as any}
      //     size={26}
      //     color={icon.color}
      //     style={styles.icon}
      //   />

      //   <View style={styles.textDetails}>
      //     <Text style={styles.alertTitle}>
      //       {item.license_plate} • {item.alert_type.replace('_', ' ')}
      //     </Text>

      //     <Text style={styles.alertMessage}>{item.message}</Text>

      //     <Text style={styles.alertTime}>
      //       {new Date(item.created_at).toLocaleString()}
      //     </Text>
      //   </View>

      //   {/* DISMISS BUTTON */}
      //   <TouchableOpacity onPress={() => handleDismiss(item.alert_id)} style={styles.dismissBtn}>
      //     <Ionicons name="checkmark-done-outline" size={24} color="#4CAF50" />
      //   </TouchableOpacity>
      // </View>

      <GestureHandlerRootView>
        <Swipeable
          renderRightActions={(progress, dragX) => 
            renderRightActions(item.alert_id, progress, dragX)
          }
          onSwipeableOpen={() => handleDismiss(item.alert_id)} // Option: delete automatically on full swipe
        >
          <View style={styles.alertCard}>
            <Ionicons name={icon.name as any} size={26} color={icon.color} style={styles.icon} />
            <View style={styles.textDetails}>
              <Text style={styles.alertTitle}>
                {item.license_plate} • {item.alert_type.replace('_', ' ')}
              </Text>
              <Text style={styles.alertMessage}>{item.message}</Text>
              <Text style={styles.alertTime}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          </View>
        </Swipeable>
      </GestureHandlerRootView>


    );
  };

  /* ==============================
     LOADING STATE
  ================================ */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3f51b5" />
      </View>
    );
  }

  /* ==============================
     MAIN VIEW
  ================================ */
  return (
    <View style={styles.container}>
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
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
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
  dismissBtn: {
    padding: 10,
    marginLeft: 5,
  },
  deleteBox: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '90%',
    flexDirection: 'row',
    borderRadius: 10,
    marginTop: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 5,
  },
});

