import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="help-circle-outline" size={40} color="#3f51b5" />
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>
          We are here to help you with any issues or questions.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Frequently Asked Questions</Text>

        <Text style={styles.text}>
          • How does the live tracking work?
        </Text>
        <Text style={styles.answer}>
          The app tracks GPS data in real time and updates the map instantly.
        </Text>

        <Text style={styles.text}>
          • What should I do if GPS is not working?
        </Text>
        <Text style={styles.answer}>
          Make sure location permission is enabled and GPS is turned on.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contact Support</Text>

        <Text style={styles.text}>Email: support@gpstracker.com</Text>
        <Text style={styles.text}>Phone: +94 77 123 4567</Text>
        <Text style={styles.text}>Working Hours: 9:00 AM - 6:00 PM</Text>
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
    marginBottom: 6,
    color: "#333",
  },
  answer: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    marginLeft: 10,
  },
});
