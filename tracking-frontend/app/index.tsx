import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import * as Font from 'expo-font'; 

const TARGET_TEXT = 'PARTH';
const FONT_NAME = 'PlaywriteNorge';

// 1. Define the font loading function
const loadFonts = () => {
    // Note: It's better to use relative paths like '../assets/fonts/...' 
    // instead of absolute paths like 'D:/Project/...'
    return Font.loadAsync({
        [FONT_NAME]: require('D:/Project/Tracker_app/tracking-frontend/assets/font/PlaywriteNO-Regular.ttf'), 
    });
};

export default function Home() {
    const [textIndex, setTextIndex] = useState(0);
    const [fontLoaded, setFontLoaded] = useState(false);
    
    // The text being displayed, revealed one character at a time
    const displayedText = TARGET_TEXT.substring(0, textIndex);

    // 🚀 NEW EFFECT 1: Handle Font Loading and Initialization
    useEffect(() => {
        // Use an async function inside the effect to await Font loading
        const initApp = async () => {
            try {
                // Wait for the font to load
                await loadFonts();
                setFontLoaded(true);
            } catch (error) {
                console.error("Font loading error:", error);
                // Handle font load failure (e.g., skip animation, proceed anyway)
                setFontLoaded(true); 
            }
        };

        initApp();
    }, []); // Run only once on mount

    // 🚀 NEW EFFECT 2: Handle Writing Animation and Redirection
    useEffect(() => {
        if (!fontLoaded) {
            return; // Wait until font is loaded
        }
        
        // A. Writing Animation
        if (textIndex < TARGET_TEXT.length) {
            const writeTimer = setTimeout(() => {
                setTextIndex(prevIndex => prevIndex + 1);
            }, 150);
            
            return () => clearTimeout(writeTimer);
        } 
        
        // B. Redirection after writing is complete
        if (textIndex === TARGET_TEXT.length) {
            const redirectTimer = setTimeout(() => {
                // Ensure the path matches your Expo Router file structure
                router.replace('/(auth)/Login'); 
            }, 1000); // 1-second delay after writing finishes

            return () => clearTimeout(redirectTimer);
        }

    }, [fontLoaded, textIndex]); // Depends on fontLoaded (trigger) and textIndex (animation step)


    // 3. Render
    if (!fontLoaded) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Loading Assets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            
            <Stack.Screen options={{ title: "Welcome" }} />

            {/* Use the dynamically loaded font */}
            <Text style={[styles.animatedText, { fontFamily: FONT_NAME }]}>
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
    },
    subText: {
        fontSize: 24,
        color: '#666',
    }
});