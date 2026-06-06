import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';
import { UserProvider } from '../src/context/UserContext'; 

const RootLayout = () => {
  return (
    <UserProvider>
     
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />

      <Stack
        screenOptions={{
     
          headerStyle: {
            backgroundColor: '#f9f9f9', 
          },
          headerShadowVisible: false, 
          headerTintColor: '#333', 
          headerTitleAlign: 'center', 
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        {/* 1. Splash/Redirect Screen */}
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        
        {/* 2. Login Screen */}
        <Stack.Screen 
          name="(auth)/Login" 
          options={{ 
            title: 'Login',
            
            headerLeft: () => null, 
          }} 
        />

        {/* 3. Register Screen */}
        <Stack.Screen 
          name="(auth)/Register" 
          options={{ 
            title: 'Register',
          }} 
        />

        {/* 4. Forgot Password Screen */}
        <Stack.Screen 
          name="(auth)/forgot-password" 
          options={{ 
            title: 'Forgot Password',
          }} 
        />

        {/* 🚀 Main Application Group (Drawer Layout) */}
        <Stack.Screen 
          name="(app)" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </UserProvider>
  );
};

export default RootLayout;