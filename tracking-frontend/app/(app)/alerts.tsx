// // app/(app)/alerts.tsx
// import React, { useRef, useState, useCallback } from 'react';
// import { useFocusEffect, router } from 'expo-router';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   ActivityIndicator,
// } from 'react-native';
// import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// import { Ionicons } from '@expo/vector-icons';
// import { getAlerts, markAsRead } from '@/src/services/dataService';

// /* ==============================
//    TYPES
// ================================ */
// interface AlertItem {
//   alert_id: number;
//   alert_type: string;
//   message: string;
//   license_plate: string;
//   created_at: string;
// }

// export default function AlertsScreen() {
//   const [alerts, setAlerts] = useState<AlertItem[]>([]);
//   const [loading, setLoading] = useState(true);
  
//   // Use string keys for Maps to match alert_id.toString()
//   const rowRefs = useRef<Map<string, Swipeable>>(new Map());
//   const heightAnims = useRef<Map<string, Animated.Value>>(new Map());

//   /* ==============================
//      DATA LOADING
//   ================================ */
//   useFocusEffect(
//     useCallback(() => {
//       const loadAlerts = async () => {
//         setLoading(true);
//         try {
//           const data = await getAlerts();
//           setAlerts(
//             data.map((a: any) => ({
//               ...a,
//               alert_type: a.alert_type ?? 'UNKNOWN',
//             }))
//           );
//         } catch (error: any) {
//           if (error?.message?.includes('Authentication')) {
//             router.replace('/(auth)/Login');
//           }
//         } finally {
//           setLoading(false);
//         }
//       };
//       loadAlerts();
//     }, [])
//   );

//   /* ==============================
//      ACTIONS
//   ================================ */
//   const closeOthers = (id: string) => {
//     rowRefs.current.forEach((ref, key) => {
//       if (key !== id) {
//         ref?.close();
//       }
//     });
//   };

//   const deleteItem = async (id: string, anim: Animated.Value) => {
//     try {
//       // Call API first
//       await markAsRead(parseInt(id));

//       // Animate out
//       Animated.timing(anim, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: false, // Height/ScaleY requires false for layout changes
//       }).start(() => {
//         setAlerts((prev) => prev.filter((item) => item.alert_id.toString() !== id));
//         rowRefs.current.delete(id);
//         heightAnims.current.delete(id);
//       });
//     } catch (error) {
//       console.error("Failed to dismiss alert", error);
//       const ref = rowRefs.current.get(id);
//       ref?.close();
//     }
//   };

//   /* ==============================
//      RENDER HELPERS
//   ================================ */
//   const renderItem = ({ item }: { item: AlertItem }) => {
//     const idStr = item.alert_id.toString();

//     // Initialize animation value if it doesn't exist
//     if (!heightAnims.current.has(idStr)) {
//       heightAnims.current.set(idStr, new Animated.Value(1));
//     }
//     const heightAnim = heightAnims.current.get(idStr)!;

//     const renderRightActions = () => (
//       <TouchableOpacity
//         style={styles.deleteBtn}
//         onPress={() => deleteItem(idStr, heightAnim)}
//       >
//         <Ionicons name="trash-outline" size={24} color="#fff" />
//         <Text style={styles.deleteText}>Dismiss</Text>
//       </TouchableOpacity>
//     );

//     return (
//       <Animated.View
//         style={{
//           transform: [{ scaleY: heightAnim }],
//           opacity: heightAnim,
//         }}
//       >
//         <Swipeable
//           ref={(ref) => {
//             if (ref) rowRefs.current.set(idStr, ref);
//           }}
//           renderRightActions={renderRightActions}
//           onSwipeableOpen={() => closeOthers(idStr)}
//           overshootRight={false}
//           rightThreshold={40}
//         >
//           <View style={styles.row}>
//             <View style={styles.content}>
//               <Text style={styles.title}>
//                 {item.license_plate} • {item.alert_type}
//               </Text>
//               <Text style={styles.message}>{item.message}</Text>
//               <Text style={styles.time}>
//                 {new Date(item.created_at).toLocaleTimeString()}
//               </Text>
//             </View>
//             <Ionicons name="chevron-back" size={16} color="#ccc" />
//           </View>
//         </Swipeable>
//       </Animated.View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#3f51b5" />
//       </View>
//     );
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         <FlatList
//           data={alerts}
//           keyExtractor={(item) => item.alert_id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ padding: 12 }}
//           ListEmptyComponent={
//             <View style={styles.center}>
//               <Text style={{ color: '#999' }}>No alerts found</Text>
//             </View>
//           }
//         />
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// /* ==============================
//    STYLES
// ================================ */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f2f2f2',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 10,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   content: {
//     flex: 1,
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 14,
//     color: '#333',
//   },
//   message: {
//     fontSize: 13,
//     color: '#666',
//     marginVertical: 4,
//   },
//   time: {
//     fontSize: 11,
//     color: '#999',
//   },
//   deleteBtn: {
//     backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 80,
//     borderRadius: 12,
//     marginBottom: 10,
//     marginLeft: 10,
//   },
//   deleteText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: '600',
//     marginTop: 4,
//   },
// });










// import React, { useRef, useState, useCallback } from 'react';
// import { useFocusEffect, router } from 'expo-router';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   ActivityIndicator,
//   RefreshControl, // 1. Import RefreshControl
// } from 'react-native';
// import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// import { Ionicons } from '@expo/vector-icons';
// import { getAlerts, markAsRead } from '@/src/services/dataService';

// interface AlertItem {
//   alert_id: number;
//   alert_type: string;
//   message: string;
//   license_plate: string;
//   created_at: string;
// }

// export default function AlertsScreen() {
//   const [alerts, setAlerts] = useState<AlertItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false); // 2. State for refreshing

//   const rowRefs = useRef<Map<string, Swipeable>>(new Map());
//   const heightAnims = useRef<Map<string, Animated.Value>>(new Map());

//   /* ==============================
//      DATA FETCHING
//   ================================ */
//   const loadAlerts = async (isRefreshing = false) => {
//     if (isRefreshing) setRefreshing(true);
//     else setLoading(true);

//     try {
//       const data = await getAlerts();
//       setAlerts(
//         data.map((a: any) => ({
//           ...a,
//           alert_type: a.alert_type ?? 'UNKNOWN',
//         }))
//       );
//     } catch (error: any) {
//       if (error?.message?.includes('Authentication')) {
//         router.replace('/(auth)/Login');
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadAlerts();
//     }, [])
//   );

//   const onRefresh = useCallback(() => {
//     loadAlerts(true);
//   }, []);

//   /* ==============================
//      SWIPE ACTIONS
//   ================================ */
//   const closeOthers = (id: string) => {
//     rowRefs.current.forEach((ref, key) => {
//       if (key !== id) ref?.close();
//     });
//   };

//   const deleteItem = async (id: string, anim: Animated.Value) => {
//     try {
//       await markAsRead(parseInt(id));
      
//       Animated.timing(anim, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: false,
//       }).start(() => {
//         setAlerts((prev) => prev.filter((item) => item.alert_id.toString() !== id));
//         rowRefs.current.delete(id);
//         heightAnims.current.delete(id);
//       });
//     } catch (error) {
//       rowRefs.current.get(id)?.close();
//     }
//   };

//   /* ==============================
//      RENDER
//   ================================ */
//   const renderItem = ({ item }: { item: AlertItem }) => {
//     const idStr = item.alert_id.toString();
//     if (!heightAnims.current.has(idStr)) {
//       heightAnims.current.set(idStr, new Animated.Value(1));
//     }
//     const heightAnim = heightAnims.current.get(idStr)!;

//     return (
//       <Animated.View style={{ transform: [{ scaleY: heightAnim }], opacity: heightAnim }}>
//         <Swipeable
//           ref={(ref) => { if (ref) rowRefs.current.set(idStr, ref); }}
//           onSwipeableOpen={() => closeOthers(idStr)}
//           overshootRight={false}
//           renderRightActions={() => (
//             <TouchableOpacity 
//               style={styles.deleteBtn} 
//               onPress={() => deleteItem(idStr, heightAnim)}
//             >
//               <Ionicons name="trash-outline" size={24} color="#fff" />
//             </TouchableOpacity>
//           )}
//         >
//           <View style={styles.row}>
//             <View style={styles.content}>
//               <Text style={styles.title}>{item.license_plate} • {item.alert_type}</Text>
//               <Text style={styles.message}>{item.message}</Text>
//               <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString()}</Text>
//             </View>
//             <Ionicons name="chevron-back" size={16} color="#ccc" />
//           </View>
//         </Swipeable>
//       </Animated.View>
//     );
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {loading && !refreshing ? (
//           <View style={styles.center}><ActivityIndicator size="large" color="#3f51b5" /></View>
//         ) : (
//           <FlatList
//             data={alerts}
//             keyExtractor={(item) => item.alert_id.toString()}
//             renderItem={renderItem}
//             contentContainerStyle={{ padding: 12 }}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3f51b5']} />
//             }
//             ListEmptyComponent={
//               <View style={styles.center}><Text style={{ color: '#999' }}>No alerts found</Text></View>
//             }
//           />
//         )}
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f2f2f2' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 10,
//   },
//   content: { flex: 1 },
//   title: { fontWeight: 'bold', fontSize: 14, color: '#333' },
//   message: { fontSize: 13, color: '#666', marginVertical: 4 },
//   time: { fontSize: 11, color: '#999' },
//   deleteBtn: {
//     backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 70,
//     borderRadius: 12,
//     marginBottom: 10,
//     marginLeft: 10,
//   },
// });



// import React, { useRef, useState, useCallback } from 'react';
// import { useFocusEffect, router } from 'expo-router';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Animated,
//   ActivityIndicator,
//   RefreshControl,
// } from 'react-native';
// import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
// import { Ionicons } from '@expo/vector-icons';
// import { getAlerts, markAsRead } from '@/src/services/dataService';

// /* ==============================
//    TYPES
// ================================ */
// interface AlertItem {
//   alert_id: number;
//   alert_type: string;
//   message: string;
//   license_plate: string;
//   created_at: string;
// }

// /* ==============================
//    ICON SELECTOR HELPER
// ================================ */
// const getIcon = (type?: string) => {
//   if (!type) {
//     return { name: 'alert-circle-outline', color: '#9e9e9e' };
//   }

//   switch (type.toLowerCase()) {
//     case 'sos':
//       return { name: 'warning-outline', color: '#f44336' };
//     case 'overspeed':
//       return { name: 'speedometer-outline', color: '#ff5722' };
//     case 'geofence':
//       return { name: 'map-outline', color: '#3f51b5' };
//     case 'low_battery':
//       return { name: 'battery-dead-outline', color: '#ff9800' };
//     case 'power_cut':
//       return { name: 'flash-outline', color: '#795548' };
//     default:
//       return { name: 'notifications-outline', color: '#607d8b' };
//   }
// };

// export default function AlertsScreen() {
//   const [alerts, setAlerts] = useState<AlertItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Refs for managing animations and swipe states
//   const rowRefs = useRef<Map<string, Swipeable>>(new Map());
//   const heightAnims = useRef<Map<string, Animated.Value>>(new Map());

//   /* ==============================
//      DATA FETCHING
//   ================================ */
//   const loadAlerts = async (isRefreshing = false) => {
//     if (isRefreshing) setRefreshing(true);
//     else setLoading(true);

//     try {
//       const data = await getAlerts();
//       setAlerts(
//         data.map((a: any) => ({
//           ...a,
//           alert_type: a.alert_type ?? 'UNKNOWN',
//         }))
//       );
//     } catch (error: any) {
//       if (error?.message?.includes('Authentication')) {
//         router.replace('/(auth)/Login');
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadAlerts();
//     }, [])
//   );

//   const onRefresh = useCallback(() => {
//     loadAlerts(true);
//   }, []);

//   /* ==============================
//      SWIPE ACTIONS
//   ================================ */
//   const closeOthers = (id: string) => {
//     rowRefs.current.forEach((ref, key) => {
//       if (key !== id) ref?.close();
//     });
//   };

//   const deleteItem = async (id: string, anim: Animated.Value) => {
//     try {
//       // Mark as read in Backend
//       await markAsRead(parseInt(id));
      
//       // Animate out (Shrink height and fade)
//       Animated.timing(anim, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: false,
//       }).start(() => {
//         setAlerts((prev) => prev.filter((item) => item.alert_id.toString() !== id));
//         rowRefs.current.delete(id);
//         heightAnims.current.delete(id);
//       });
//     } catch (error) {
//       console.error("Dismiss error", error);
//       rowRefs.current.get(id)?.close();
//     }
//   };

//   /* ==============================
//      RENDER ROW
//   ================================ */
//   const renderItem = ({ item }: { item: AlertItem }) => {
//     const idStr = item.alert_id.toString();
//     const icon = getIcon(item.alert_type);

//     // Ensure each item has its own animation value
//     if (!heightAnims.current.has(idStr)) {
//       heightAnims.current.set(idStr, new Animated.Value(1));
//     }
//     const heightAnim = heightAnims.current.get(idStr)!;

//     return (
//       <Animated.View 
//         style={{ 
//           transform: [{ scaleY: heightAnim }], 
//           opacity: heightAnim,
//           // This keeps the layout jumping to a minimum during the shrink
//           maxHeight: heightAnim.interpolate({
//             inputRange: [0, 1],
//             outputRange: [0, 500] 
//           })
//         }}
//       >
//         <Swipeable
//           ref={(ref) => { if (ref) rowRefs.current.set(idStr, ref); }}
//           onSwipeableOpen={() => closeOthers(idStr)}
//           overshootRight={false}
//           renderRightActions={() => (
//             <TouchableOpacity 
//               style={styles.deleteBtn} 
//               onPress={() => deleteItem(idStr, heightAnim)}
//             >
//               <Ionicons name="trash-outline" size={24} color="#fff" />
//               <Text style={styles.deleteText}>Dismiss</Text>
//             </TouchableOpacity>
//           )}
//         >
//           <View style={styles.row}>
//             {/* Dynamic Icon with light background tint */}
//             <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
//               <Ionicons name={icon.name as any} size={22} color={icon.color} />
//             </View>

//             <View style={styles.content}>
//               <Text style={styles.title}>
//                 {item.license_plate} • {item.alert_type.replace('_', ' ').toUpperCase()}
//               </Text>
//               <Text style={styles.message} numberOfLines={2}>
//                 {item.message}
//               </Text>
//               <Text style={styles.time}>
//                 {new Date(item.created_at).toLocaleString()}
//               </Text>
//             </View>
            
//             <Ionicons name="chevron-back" size={14} color="#ddd" />
//           </View>
//         </Swipeable>
//       </Animated.View>
//     );
//   };

//   /* ==============================
//      MAIN VIEW
//   ================================ */
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {loading && !refreshing ? (
//           <View style={styles.center}>
//             <ActivityIndicator size="large" color="#3f51b5" />
//           </View>
//         ) : (
//           <FlatList
//             data={alerts}
//             keyExtractor={(item) => item.alert_id.toString()}
//             renderItem={renderItem}
//             contentContainerStyle={{ padding: 12 }}
//             refreshControl={
//               <RefreshControl 
//                 refreshing={refreshing} 
//                 onRefresh={onRefresh} 
//                 colors={['#3f51b5']} 
//               />
//             }
//             ListEmptyComponent={
//               <View style={styles.center}>
//                 <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
//                 <Text style={styles.emptyText}>No alerts found</Text>
//               </View>
//             }
//           />
//         )}
//       </View>
//     </GestureHandlerRootView>
//   );
// }

// /* ==============================
//    STYLES
// ================================ */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f7',
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 14,
//     borderRadius: 14,
//     marginBottom: 10,
//     // Shadow/Elevation
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 3,
//   },
//   iconContainer: {
//     width: 44,
//     height: 44,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//   },
//   content: {
//     flex: 1,
//   },
//   title: {
//     fontWeight: '700',
//     fontSize: 13,
//     color: '#1a1a1a',
//     letterSpacing: 0.2,
//   },
//   message: {
//     fontSize: 13,
//     color: '#666',
//     marginTop: 3,
//     lineHeight: 18,
//   },
//   time: {
//     fontSize: 11,
//     color: '#999',
//     marginTop: 6,
//   },
//   emptyText: {
//     color: '#999',
//     marginTop: 10,
//     fontSize: 15,
//   },
//   deleteBtn: {
//     backgroundColor: '#FF3B30',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 80,
//     borderRadius: 14,
//     marginBottom: 10,
//     marginLeft: 10,
//   },
//   deleteText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
// });



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

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const rowRefs = useRef<Map<string, Swipeable>>(new Map());
  const heightAnims = useRef<Map<string, Animated.Value>>(new Map());

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
      await markAsRead(parseInt(id));
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setAlerts((prev) => prev.filter((item) => item.alert_id.toString() !== id));
        rowRefs.current.delete(id);
        heightAnims.current.delete(id);
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

    if (!heightAnims.current.has(idStr)) {
      heightAnims.current.set(idStr, new Animated.Value(1));
    }
    const heightAnim = heightAnims.current.get(idStr)!;

    return (
      <Animated.View 
        style={{ 
          transform: [{ scaleY: heightAnim }], 
          opacity: heightAnim,
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 500] 
          })
        }}
      >
        <Swipeable
          ref={(ref) => { if (ref) rowRefs.current.set(idStr, ref); }}
          onSwipeableOpen={() => closeOthers(idStr)}
          overshootRight={false}
          renderRightActions={() => (
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => deleteItem(idStr, heightAnim)}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text style={styles.deleteText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        >
          <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
              <Ionicons name={icon.name as any} size={22} color={icon.color} />
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>
                {item.license_plate} • {item.alert_type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
              <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
            <Ionicons name="chevron-back" size={14} color="#ddd" />
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
            <Text style={styles.hintText}>
              ← Swipe left to dismiss alerts
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
            contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3f51b5']} />
            }
            // 2. Styled Empty Component
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
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
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Hint Styles
  hintContainer: {
    padding: 8,
    backgroundColor: '#e8eaf6',
  },
  hintText: {
    fontSize: 11,
    color: '#5c6bc0',
    textAlign: 'center',
    fontWeight: '500',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
  title: { fontWeight: '700', fontSize: 13, color: '#1a1a1a' },
  message: { fontSize: 13, color: '#666', marginTop: 3 },
  time: { fontSize: 11, color: '#999', marginTop: 6 },

  // Empty State Styles
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },

  deleteBtn: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 14,
    marginBottom: 10,
    marginLeft: 10,
  },
  deleteText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
});