import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TermsScreen() {
  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false} // 📱 ScrollBar එක හංගලා Clean ලුක් එකක් දෙනවා
    >
      {/* 1. Header Card */}
      <View style={styles.card}>
        <View style={styles.iconBg}>
          <Ionicons name="document-text" size={36} color="#3f51b5" />
        </View>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>
          Please read these terms carefully before using JumboWatch tracking services.
        </Text>
      </View>

      {/* 2. Legal Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing or using this application, you agree to be bound by these
          terms and conditions. If you do not agree, please refrain from using the service.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Use of Service</Text>
        <Text style={styles.text}>
          You agree to use the service only for lawful purposes, specifically for monitoring 
          and managing registered devices in accordance with local regulations.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Data & Privacy</Text>
        <Text style={styles.text}>
          We respect your privacy. Real-time GPS location data is securely processed only to provide 
          live tracking features and notifications. Your tracking logs are confidential and never shared.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
        <Text style={styles.text}>
          JumboWatch provides real-time tracking software. We are not legally liable for hardware 
          malfunctions, network drops, or signal loss on physical GPS devices that cause data delay.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these terms to reflect feature changes. Continued use of the app 
          following updates constitutes full acceptance of the revised terms.
        </Text>
      </View>

      {/* යටින් තියෙන Card එක කැපෙන්නේ නැතුව ලස්සනට පේන්න දාපු පොඩි Spacing එකක් */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Layout එකේ Background එකටම මැච් කරා
  },
  card: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eef0f5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 }
    }),
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#edf0f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eef0f5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 }
    }),
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: '#333'
  },
  text: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20, // 📝 කියවන්න පහසු වෙන්න Text ලයින් දෙකක් අතර උස වැඩි කරා
  },
});