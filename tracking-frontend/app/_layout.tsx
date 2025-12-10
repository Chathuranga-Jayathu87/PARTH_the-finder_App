import { Stack } from 'expo-router';
import React from 'react';

// This is the global layout file for the entire app.
const RootLayout = () => {
  return (
    <Stack>
      {/* 1. The index route is the splash/redirect screen */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      
      {/* 2. The authentication screens (like login) */}
      <Stack.Screen 
        name="(auth)/Login" 
        options={{ headerShown: true , title: 'Login' }} 
      />

      {/* 3. The registration screen */}
      <Stack.Screen 
        name="(auth)/Register" 
        options={{ headerShown: true , title: 'Register' }} 
      />

      {/* 4. The main application screen (Dashboard/Map) */}
      <Stack.Screen 
        name="dashboard" 
        options={{ title: 'Live Tracker' }} 
      />
    </Stack>
    
  );
};

export default RootLayout;