// import React from "react";
// import { View, Text, StyleSheet, ScrollView } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// export default function HelpScreen() {
//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.card}>
//         <Ionicons name="help-circle-outline" size={40} color="#3f51b5" />
//         <Text style={styles.title}>Help & Support</Text>
//         <Text style={styles.subtitle}>
//           We are here to help you with any issues or questions.
//         </Text>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>📌 Frequently Asked Questions</Text>

//         <Text style={styles.text}>
//           • How does the live tracking work?
//         </Text>
//         <Text style={styles.answer}>
//           The app tracks GPS data in real time and updates the map instantly.
//         </Text>

//         <Text style={styles.text}>
//           • What should I do if GPS is not working?
//         </Text>
//         <Text style={styles.answer}>
//           Make sure location permission is enabled and GPS is turned on.
//         </Text>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>📞 Contact Support</Text>

//         <Text style={styles.text}>Email: support@gpstracker.com</Text>
//         <Text style={styles.text}>Phone: +94 77 123 4567</Text>
//         <Text style={styles.text}>Working Hours: 9:00 AM - 6:00 PM</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9f9f9",
//   },
//   card: {
//     alignItems: "center",
//     padding: 30,
//     backgroundColor: "#fff",
//     margin: 15,
//     borderRadius: 12,
//     elevation: 3,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginTop: 10,
//     color: "#333",
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#666",
//     marginTop: 8,
//     textAlign: "center",
//   },
//   section: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 10,
//   },
//   text: {
//     fontSize: 14,
//     marginBottom: 6,
//     color: "#333",
//   },
//   answer: {
//     fontSize: 13,
//     color: "#666",
//     marginBottom: 10,
//     marginLeft: 10,
//   },
// });



import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native"; // 1. Import Linking and TouchableOpacity
import { Ionicons, FontAwesome } from "@expo/vector-icons"; // 2. Import FontAwesome for the WhatsApp icon

export default function HelpScreen() {
  
  // 3. Function to handle WhatsApp redirection
  const openWhatsApp = () => {
    const phoneNumber = "+94771234567"; // Use international format without '+' or '00'
    const message = "Hello Support, I need help with the GPS Tracker app.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback if WhatsApp is not installed: Open in browser
          return Linking.openURL(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
        }
      })
      .catch((err) => console.error("An error occurred", err));
  };

  return (
    <View style={{ flex: 1 }}>
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
          <Text style={styles.text}>• How does the live tracking work?</Text>
          <Text style={styles.answer}>
            The app tracks GPS data in real time and updates the map instantly.
          </Text>

          <Text style={styles.text}>• What should I do if GPS is not working?</Text>
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

      {/* 4. The Floating WhatsApp Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={openWhatsApp}
        activeOpacity={0.8}
      >
        <FontAwesome name="whatsapp" size={35} color="#fff" />
      </TouchableOpacity>
    </View>
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
  // 5. FAB Styles
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#25D366', // WhatsApp Green
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});