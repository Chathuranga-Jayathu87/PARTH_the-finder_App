import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useFonts } from 'expo-font'; 
import { useUser } from '../src/context/UserContext'; 
const TARGET_TEXT = 'PARTH';

export default function Home() {
  const [textIndex, setTextIndex] = useState<number>(0);
  const { user, loading: contextLoading } = useUser();

  const [fontsLoaded, fontError] = useFonts({
    'PlaywriteNorge': require('../src/assets/font/PlaywriteNO-Regular.ttf'), 
  });
  
  const displayedText = TARGET_TEXT.substring(0, textIndex);

  useEffect(() => {
    if (!fontsLoaded) return; 
    
    if (textIndex < TARGET_TEXT.length) {
      const writeTimer = setTimeout(() => {
        setTextIndex(prevIndex => prevIndex + 1);
      }, 150);
      
      return () => clearTimeout(writeTimer);
    } 
    
    if (textIndex === TARGET_TEXT.length) {
      if (contextLoading) return;

      const redirectTimer = setTimeout(() => {
        if (user) {
          router.replace('/(app)'); 
        } else {
          router.replace('/(auth)/Login'); 
        }
      }, 1000); 
      return () => clearTimeout(redirectTimer);
    }

  }, [fontsLoaded, textIndex, contextLoading, user]);


  
  if (!fontsLoaded || contextLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Assets...</Text>
      </View>
    );
  }

    if (fontError) {
    console.error("Font loading error:", fontError);
  }

  return (
    <View style={styles.container}>
  
      <Stack.Screen options={{ headerShown: false }} />

  
      <Text style={[styles.animatedText, { fontFamily: 'PlaywriteNorge' }]}>
        {displayedText}
      </Text>
      
      <Text style={styles.subText}>GPS Tracker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#fff',
  },
  animatedText: {
    fontSize: 56, 
    color: '#007AFF',
    marginBottom: 10,
    fontWeight: 'normal',
  },
  subText: {
    fontSize: 24,
    color: '#666',
    letterSpacing: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666'
  }
});