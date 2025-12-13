// import { View, Text } from "react-native";

// export default function terms () {
//     return(
//         <View>
//         <Text>Terms</Text>
//         </View>
//     )
// }

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="document-text-outline" size={40} color="#3f51b5" />
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.subtitle}>
          Please read these terms carefully before using our service.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing or using this application, you agree to be bound by these
          terms and conditions.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Use of Service</Text>
        <Text style={styles.text}>
          You agree to use the service only for lawful purposes and in accordance
          with all applicable laws.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Data & Privacy</Text>
        <Text style={styles.text}>
          We respect your privacy. GPS data is collected only to provide tracking
          services and is not shared without consent.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
        <Text style={styles.text}>
          We are not responsible for any damages resulting from the use of this
          application.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these terms at any time. Continued use of the app means
          acceptance of the updated terms.
        </Text>
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
    lineHeight: 20,
  },
});
