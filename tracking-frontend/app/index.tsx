// import { Link, Stack , router} from "expo-router";
// import { useEffect } from "react";
// import { View, Text, ActivityIndicator } from "react-native";

// export default function Home() {
//   return (
    
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//     <>
//        <Stack.Screen options={{title:"PARTH"}}/>
//      </>

//       <Text style={{ fontSize: 24 }}>Welcome <Text style={{ fontWeight: 'bold', fontFamily: 'Playwrite Norge' }}>PARTH </Text>Gps Tracker</Text>

//       <Link href="/(auth)/Login" style={{ fontSize: 18, marginTop: 20, color: 'blue' }}>
//         Go to Login
//       </Link>
//     </View>
//   );
// }



// import { router } from "expo-router";
// import { useEffect } from "react";
// import { ActivityIndicator, View } from "react-native";

// export default function Index() {
//   // Use useEffect to run the redirect when the component mounts
//   useEffect(() => {
//     // In Expo Router, the path to the login screen is the folder name + file name
//     // (auth)/login, which is '/(auth)/login'
//     router.replace('/(auth)/Login'); 
//   }, []);

//   // Show a loading indicator while the redirect happens
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <ActivityIndicator size="large" />
//     </View>
//   );
// }


// import { Stack, router } from "expo-router";
// import { useEffect } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

// export default function Home() {
  
//   useEffect(() => {
//     // 1. Set a timer to automatically redirect the user
//     const timer = setTimeout(() => {
//       // 2. Navigate to the login screen after 2500ms (2.5 seconds)
//       router.replace('/(auth)/Login'); 
//     }, 2500);

//     // 3. Clean up the timer when the component unmounts
//     return () => clearTimeout(timer);
//   }, []); // Run only once on mount

//   return (
//     // The View should use styles for centering
//     <View style={styles.container}>
      
//       {/* Stack.Screen options are typically in _layout.js, 
//           but adding it here won't hurt if you want to override the title. */}
//       <Stack.Screen options={{ title: "Welcome" }} />

//       <Text style={styles.welcomeText}>
//         Welcome 
//         <Text style={styles.boldText}>PARTH </Text>
//         GPS Tracker
//       </Text>
      
//       {/* Optional: Add a small loading spinner below the text */}
//       <ActivityIndicator size="small" style={styles.loader} />
      
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1, 
//         justifyContent: "center", 
//         alignItems: "center",
//         backgroundColor: '#fff', // Use a background color
//     },
//     welcomeText: { 
//         fontSize: 24, 
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     boldText: {
//         fontWeight: 'bold', 
//         // You'll need to configure custom fonts (like Playwrite Norge)
//         // separately in Expo if you want to use them.
//     },
//     loader: {
//         marginTop: 30,
//     }
// });


// import { Stack, router } from "expo-router";
// import React, { useEffect, useRef } from "react";
// import { View, Text, StyleSheet, Animated, Easing } from "react-native";

// export default function Home() {
  
//   // 1. Initialize the Animated Value for scaling
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     // --- Animation Logic ---
//     // Create an infinitely looping animation sequence (scale up, then down)
//     const startAnimation = () => {
//         Animated.loop(
//             Animated.sequence([
//                 // Scale up 20%
//                 Animated.timing(scaleAnim, {
//                     toValue: 1.2,
//                     duration: 500, // 0.5 seconds
//                     easing: Easing.inOut(Easing.ease),
//                     useNativeDriver: true, // Use native threads for better performance
//                 }),
//                 // Scale back to normal
//                 Animated.timing(scaleAnim, {
//                     toValue: 1,
//                     duration: 500,
//                     easing: Easing.inOut(Easing.ease),
//                     useNativeDriver: true,
//                 }),
//             ]),
//         ).start();
//     };

//     startAnimation(); // Start the animation when the screen mounts
    
//     // --- Redirection Logic ---
//     // Set a timer to automatically redirect the user after the splash screen
//     const timer = setTimeout(() => {
//       router.replace('/(auth)/Login'); 
//     }, 2500); // Redirect after 2.5 seconds

//     // Cleanup function: stop the timer when the component is removed
//     return () => {
//         clearTimeout(timer);
//         // Note: The animation will naturally stop when the component unmounts.
//     };
//   }, [scaleAnim]); // Re-run effect only if scaleAnim changes (it won't, but it's good practice)

//   return (
//     <View style={styles.container}>
      
//       {/* Set Stack Options here, or in _layout.js */}
//       <Stack.Screen options={{ title: "Welcome" }} />

//       {/* 🚀 Animated Text: The "PARTH" text applies the scaling transformation */}
//       <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//         <Text style={styles.animatedText}>PARTH</Text>
//       </Animated.View>
      
//       {/* Static "GPS Tracker" text below the animation */}
//       <Text style={styles.subText}>GPS Tracker</Text>

//     </View>
//   );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1, 
//         justifyContent: "center", 
//         alignItems: "center",
//         backgroundColor: '#fff',
//     },
//     animatedText: {
//         fontSize: 56, // Large size for impact
//         fontWeight: '900', // Very bold
//         color: '#007AFF', // Distinct color (e.g., primary blue)
//         marginBottom: 10,
//     },
//     subText: {
//         fontSize: 24,
//         color: '#666',
//     }
// });



// import React, { useEffect, useState, useCallback } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import { Stack, router } from 'expo-router';
// import * as Font from 'expo-font'; // For loading custom font

// const TARGET_TEXT = 'PARTH';
// const FONT_NAME = 'PlaywriteNorge'; // The key used to reference the font

// // 1. Define the font loading function
// const loadFonts = () => {
//   return Font.loadAsync({
//     // IMPORTANT: Replace the path with the actual file name and location
//     [FONT_NAME]: require('D:/Project/Tracker_app/tracking-frontend/assets/font/PlaywriteNO-Regular.ttf'),
//   });
// };

// export default function Home() {
//   const [textIndex, setTextIndex] = useState(0);
//   const [fontLoaded, setFontLoaded] = useState(false);
//   const [redirectScheduled, setRedirectScheduled] = useState(false);
  
//   // The text being displayed, revealed one character at a time
//   const displayedText = TARGET_TEXT.substring(0, textIndex);

//   // 2. Load the font and set up the animation
//   useEffect(() => {
//     // A. Load the custom font
//     loadFonts().then(() => {
//         setFontLoaded(true);
//     });

//     // B. Start the writing animation if the font is loaded
//     if (fontLoaded) {
//       if (textIndex < TARGET_TEXT.length) {
//         // Animation step: reveal the next character after a short delay
//         const writeTimer = setTimeout(() => {
//           setTextIndex(prevIndex => prevIndex + 1);
//         }, 150); // Adjust delay for speed
        
//         return () => clearTimeout(writeTimer);
//       } else if (!redirectScheduled) {
//         // C. After writing is complete, schedule the final redirect
//         setRedirectScheduled(true);
//         const redirectTimer = setTimeout(() => {
//           router.replace('/(auth)/Login'); 
//         }, 2500); // 2.5-second delay after writing finishes

//         return () => clearTimeout(redirectTimer);
//       }
//     }
//   }, [fontLoaded, textIndex, redirectScheduled]);


//   // Show a loading screen while fonts are loading
//   if (!fontLoaded) {
//     return (
//         <View style={styles.container}>
//             <ActivityIndicator size="large" color="#0000ff" />
//             <Text style={{ marginTop: 10 }}>Loading Assets...</Text>
//         </View>
//     );
//   }

//   // 3. Render the Splash Screen
//   return (
//     <View style={styles.container}>
      
//       <Stack.Screen options={{ title: "Welcome" }} />

//       <Text style={[styles.animatedText, { fontFamily: FONT_NAME }]}>
//         {displayedText}
//       </Text>
      
//       <Text style={styles.subText}>GPS Tracker</Text>
      
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1, 
//         justifyContent: "center", 
//         alignItems: "center",
//         backgroundColor: '#fff',
//     },
//     animatedText: {
//         fontSize: 56, 
//         color: '#007AFF',
//         marginBottom: 10,
//         // The font family is applied here dynamically
//     },
//     subText: {
//         fontSize: 24,
//         color: '#666',
//     }
// });




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