import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 💡 Why Choose Us ලිස්ට් එක ලස්සන කරන්න දාපු පොඩි Row Component එකක්
interface FeatureRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const FeatureRow = ({ icon, text }: FeatureRowProps) => (
  <View style={styles.featureRow}>
    <View style={styles.featureIconBg}>
      <Ionicons name={icon} size={16} color="#3f51b5" />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

export default function AboutUsScreen() {
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Card */}
      <View style={styles.card}>
        <View style={styles.iconBg}>
          <Ionicons name="information-circle" size={36} color="#3f51b5" />
        </View>
        <Text style={styles.title}>About JumboWatch</Text>
        <Text style={styles.subtitle}>
          Empowering communities with smart tracking and live monitoring solutions.
        </Text>
      </View>

      {/* 2. Who We Are */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Who We Are</Text>
        <Text style={styles.text}>
          JumboWatch provides an advanced, real-time GPS tracking solution tailored for high-accuracy 
          vehicle monitoring and automated alert management. Designed with robust infrastructure, 
          our platform bridges hardware and software to deliver reliable location insights instantly.
        </Text>
      </View>

      {/* 3. Our Mission */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Our Mission</Text>
        <Text style={styles.text}>
          To offer a secure, high-performance tracking system that ensures maximum asset safety, 
          instant alert dispatching, and localized communication to mitigate issues efficiently 
          through real-time tracking data.
        </Text>
      </View>

      {/* 4. Why Choose Us (With Custom Icon Bullets) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Why Choose Us?</Text>
        
        <FeatureRow icon="time-outline" text="Real-time Tracking & Sub-second Updates" />
        <FeatureRow icon="locate-outline" text="High-precision GPS Data Accuracy" />
        <FeatureRow icon="shield-checkmark-outline" text="Secure & Encrypted Communication" />
        <FeatureRow icon="phone-portrait-outline" text="Intuitive & User-friendly Mobile Interface" />
        <FeatureRow icon="notifications-outline" text="Instant Real-time Alarm & Push System" />
      </View>

      {/* Spacing for bottom tab/safe area navigation gap */}
      <View style={{ height: 40 }} />
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
    marginBottom: 12,
    color: '#333'
  },
  text: {
    fontSize: 13,
    color: "#555",
    lineHeight: 21,
  },
  // Custom Feature Rows Styles
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIconBg: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#edf0f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
});