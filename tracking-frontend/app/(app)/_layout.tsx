// app/(app)/_layout.tsx
import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '../../components/CustomDrawerContent'; // We'll create this next
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ParamListBase } from '@react-navigation/native';
import { router } from 'expo-router';

type SidebarButtonProps = {
  navigation: DrawerNavigationProp<ParamListBase>;
};


const SidebarButton = ({ navigation }: SidebarButtonProps) =>(
            <TouchableOpacity 
            onPress={() => navigation.openDrawer()} 
            style={{ marginLeft: 15 }}
            >
              <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 20,
                  backgroundColor: '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="menu" size={24} color="#3f51b5" />
              </View>
            </TouchableOpacity>
);


export default function DrawerLayout() {
  return (
    <Drawer 
      screenOptions={{
        headerTintColor: '#3f51b5', // Color of header text/icons
        drawerActiveTintColor: '#3f51b5', // Color for active link in sidebar
      }}
      // Use the custom content component for the full sidebar UI
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      
      <Drawer.Screen
        name="index" // Corresponds to app/(app)/index.js
        options={({ navigation }) => ({
          title: 'Live Map Dashboard',
          drawerLabel: 'Dashboard',
          headerTitle: 'Live Tracker',

          // Remove the bottom line/shadow from the header
          headerStyle: {
            //shadowColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 0,
            shadowOpacity: 0,
            height: 110,
          },
          
          // Button to open the sidebar
          headerLeft:() => (
            <TouchableOpacity 
            onPress={() => navigation.openDrawer()} 
            style={{ marginLeft: 15 }}
            >
              <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 20,
                  backgroundColor: '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="menu" size={24} color="#3f51b5" />
              </View>
            </TouchableOpacity>
          ) ,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color}  />
          ),
        })}
      />

      <Drawer.Screen
        name="settings"  
        options={({ navigation }) => ({
          title: 'Settings',
          drawerLabel: 'Settings',
          headerStyle: {
            height: 120,
          },
          headerLeft:() => <SidebarButton navigation={navigation} />,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        })}
        />

       <Drawer.Screen
        name="about"
        options={({ navigation }) => ({
          title: 'About Us',
          drawerLabel: 'About Us',
          headerStyle: {
            height: 120,
          },
          headerLeft:() => <SidebarButton navigation={navigation} />,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        })}  
        />

      <Drawer.Screen
        name="terms"
        options={({ navigation }) => ({
          title: 'Terms & Condition',
          drawerLabel: 'Terms & Condition',
          headerStyle: {
            height: 120,
          },
          headerLeft:() => <SidebarButton navigation={navigation} />,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        })}  
        />

      <Drawer.Screen
        name="help"
        options={({ navigation }) => ({
          title: 'Help & Support',
          drawerLabel: 'Help & Support',
          headerStyle: {
            height: 120,
          },
          headerLeft:() => <SidebarButton navigation={navigation} />,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        })}  
        />
      

      {/* Placeholder for future screens linked in the sidebar*/} 
      <Drawer.Screen
        name="alerts" 
        options={({ navigation }) => ({
          title: 'Alerts & Events',
          drawerLabel: 'Alerts',
          headerStyle: {
            height: 120,
          },
          headerLeft:() => <SidebarButton navigation={navigation} />,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        })} 
      />


      {/*Non display in drawer screen- vehicle-registartion */}
      <Drawer.Screen
      name="register-vehicle"
      options={{
        title: 'Vehicle Registartion',
        headerStyle: {height:120},
        headerLeft: () => (
        <TouchableOpacity style={{marginLeft:15}} onPress={() => router.replace("/(app)")}>
          <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 20,
                  backgroundColor: '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
          <Ionicons name="chevron-back" size={24} />
          </View>
        </TouchableOpacity>
        ),
        drawerItemStyle: {display:'none'},
      }}
      />
    

      <Drawer.Screen
      name="vehicle/[id]"
      options={{
        title: 'Vehicle Details',
        headerStyle: {height:120},
        headerLeft: () => (
        <TouchableOpacity style={{marginLeft:15}} onPress={() => router.replace("/(app)")}>
          <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 20,
                  backgroundColor: '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
          <Ionicons name="chevron-back" size={24} />
          </View>
        </TouchableOpacity>
        ),
        drawerItemStyle:{display:'none'},
      }}
      />


      <Drawer.Screen
      name="profile/edit"
      options={{
        title: 'Profile Edit',
        headerStyle: {height:120},
        headerLeft: () => (
        <TouchableOpacity style={{marginLeft:15}} onPress={() => router.replace("/(app)/settings")}>
          <View
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 20,
                  backgroundColor: '#e0e0e0',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
          <Ionicons name="chevron-back" size={24} />
          </View>
        </TouchableOpacity>
        ),
        drawerItemStyle:{display:'none'},
      }}
      />

    </Drawer>
  );
}