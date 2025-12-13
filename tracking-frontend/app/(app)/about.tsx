// import { View, Text } from "react-native";

// export default function about () {
//     return(
//         <View>
//             <Text>Hello</Text>
//         </View>
//     )
// }

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AboutUsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="information-circle-outline" size={40} color="#3f51b5" />
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.subtitle}>
          Learn more about our GPS Tracking platform
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Who We Are</Text>
        <Text style={styles.text}>
          We provide a real-time GPS tracking solution designed to improve safety,
          monitoring, and efficiency. Our platform helps users track vehicles,
          assets, and people with accuracy and reliability.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Our Mission</Text>
        <Text style={styles.text}>
          To deliver a secure, easy-to-use tracking system that empowers users
          with real-time location insights and alerts.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Why Choose Us?</Text>
        <Text style={styles.text}>• Real-time tracking</Text>
        <Text style={styles.text}>• Accurate GPS data</Text>
        <Text style={styles.text}>• Secure & reliable system</Text>
        <Text style={styles.text}>• User-friendly interface</Text>
        <Text style={styles.text}>• Real-time Alarm System</Text>
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  card: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
});
