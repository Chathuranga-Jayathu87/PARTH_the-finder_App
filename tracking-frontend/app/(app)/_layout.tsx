import React, { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '../../src/components/CustomDrawerContent'; 
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ParamListBase } from '@react-navigation/native';
import { router } from 'expo-router';
import { UserProvider } from '../../src/context/UserContext';
import { registerForPushNotificationsAsync } from '../../src/hooks/usePushNotifications';
import { saveExpoPushToken } from '../../src/services/notificationService';
import { getAuthToken } from '../../src/services/authService';
import { useNotificationNavigation } from '../../src/hooks/useNotificationNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type SidebarButtonProps = {
  navigation: DrawerNavigationProp<ParamListBase>;
};

// 🍔 SIDEBAR OPEN BUTTON (iOS & Android Universal)
const SidebarButton = ({ navigation }: SidebarButtonProps) => (
  <TouchableOpacity 
    onPress={() => navigation.openDrawer()} 
    style={{ marginLeft: Platform.OS === 'ios' ? 10 : 15 }}
    activeOpacity={0.7}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f2f5', 
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons name="menu" size={24} color="#3f51b5" />
    </View>
  </TouchableOpacity>
);

// 🔙 BACK BUTTON FOR INNER SCREENS (iOS & Android Universal)
type BackButtonProps = {
  backTo: string;
};

const BackButton = ({ backTo }: BackButtonProps) => (
  <TouchableOpacity 
    style={{ marginLeft: Platform.OS === 'ios' ? 10 : 15 }} 
    onPress={() => router.replace(backTo as any)}
    activeOpacity={0.7}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons name="chevron-back" size={24} color="#3f51b5" /> 
    </View>
  </TouchableOpacity>
);


function DrawerLayout() {
  useNotificationNavigation();

  useEffect(() => {
    const registerToken = async () => {
      try {
        const jwt = await getAuthToken();
        if (!jwt) return;

        const expoToken = await registerForPushNotificationsAsync();
        if (!expoToken) return;

        await saveExpoPushToken(expoToken, jwt);
        console.log("✅ Expo Token registered successfully:", expoToken);
      } catch (err) {
        console.error("Failed to register Expo Push Token:", err);
      }
    };
    registerToken();
  }, []);

  const isIOS = Platform.OS === 'ios';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />

      <Drawer 
        screenOptions={{
          headerTintColor: '#3f51b5', 
          drawerActiveTintColor: '#3f51b5', 
          headerTitleAlign: 'center', 
          headerStyle: {
            height: isIOS ? 100 : 80, 
            backgroundColor: '#f9f9f9',
            elevation: 0, 
            borderBottomWidth: 0,
            shadowOpacity: 0, 
          },
          
          headerTitleContainerStyle: {
            paddingBottom: isIOS ? 0 : 5,
          },
          headerLeftContainerStyle: {
            paddingBottom: isIOS ? 0 : 5,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        
        {/* 1. Live Map Dashboard */}
        <Drawer.Screen
          name="index" 
          options={({ navigation }) => ({
            title: 'Live Tracker',
            drawerLabel: 'Dashboard',
            headerLeft: () => <SidebarButton navigation={navigation} />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          })}
        />

        {/* 2. Settings */}
        <Drawer.Screen
          name="settings"  
          options={({ navigation }) => ({
            title: 'Settings',
            drawerLabel: 'Settings',
            headerLeft: () => <SidebarButton navigation={navigation} />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          })}
        />

        {/* 3. About Us */}
        <Drawer.Screen
          name="about"
          options={({ navigation }) => ({
            title: 'About Us',
            drawerLabel: 'About Us',
            headerLeft: () => <SidebarButton navigation={navigation} />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="information-circle-outline" size={size} color={color} />
            ),
          })}  
        />

        {/* 4. Terms & Conditions */}
        <Drawer.Screen
          name="terms"
          options={({ navigation }) => ({
            title: 'Terms & Condition',
            drawerLabel: 'Terms & Condition',
            headerLeft: () => <SidebarButton navigation={navigation} />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          })}  
        />

        {/* 5. Help & Support */}
        <Drawer.Screen
          name="help"
          options={({ navigation }) => ({
            title: 'Help & Support',
            drawerLabel: 'Help & Support',
            headerLeft: () => <SidebarButton navigation={navigation} />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="help-circle-outline" size={size} color={color} />
            ),
          })}  
        />
        
        {/* 6. Alerts */}
        <Drawer.Screen
          name="alerts" 
          options={({ navigation }) => ({
            title: 'Alerts & Events',
            drawerLabel: 'Alerts',
            headerLeft: () => <SidebarButton navigation={navigation} />,
            drawerIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          })} 
        />

        
        <Drawer.Screen
          name="register-vehicle"
          options={{
            title: 'Vehicle Registration',
            headerLeft: () => <BackButton backTo="/(app)" />, 
            drawerItemStyle: { display: 'none' },
          }}
        />

        <Drawer.Screen
          name="vehicle/[id]"
          options={{
            title: 'Vehicle Details',
            headerLeft: () => <BackButton backTo="/(app)" />,
            drawerItemStyle: { display: 'none' },
          }}
        />

        <Drawer.Screen
          name="profile/edit"
          options={{
            title: 'Profile Edit',
            headerLeft: () => <BackButton backTo="/(app)/settings" />,
            drawerItemStyle: { display: 'none' },
          }}
        />

        <Drawer.Screen
          name="settings/change-password"
          options={{
            title: 'Change Password',
            headerLeft: () => <BackButton backTo="/(app)/settings" />,
            drawerItemStyle: { display: 'none' },
          }}
        />

        <Drawer.Screen
          name="settings/notification"
          options={{
            title: 'Notification Settings',
            headerLeft: () => <BackButton backTo="/(app)/settings" />,
            drawerItemStyle: { display: 'none' },
          }}
        />

        <Drawer.Screen
          name="alerts/[id]"
          options={{
            title: 'Alert Details',
            headerLeft: () => <BackButton backTo="/(app)/alerts" />,
            drawerItemStyle: { display: 'none' },
          }}
        />

      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <DrawerLayout />
    </UserProvider>
  );
}