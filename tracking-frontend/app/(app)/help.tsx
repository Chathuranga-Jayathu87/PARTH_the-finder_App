import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from "react-native"; 
import { Ionicons, FontAwesome } from "@expo/vector-icons"; 

// FAQ සඳහා Interface එකක්
interface FAQItemProps {
  question: string;
  answer: string;
}

// 📌 ACCORDION COMPONENT (ප්‍රශ්න උඩ ක්ලික් කරාම උත්තර පාත් වන කම්පෝනන්ට් එක)
const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <View style={styles.faqWrapper}>
      <TouchableOpacity 
        style={styles.faqHeader} 
        onPress={() => setIsOpen(!isOpen)} 
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={18} 
          color="#3f51b5" 
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpScreen() {
  
  // 🟢 WhatsApp එක විවෘත කිරීම (Universal Link Method - 100% Safe)
  const openWhatsApp = () => {
    const phoneNumber = "94771234567"; // '00' හෝ '+' නැතුව නිවැරදි ජාත්‍යන්තර ආකෘතිය
    const message = "Hello JumboWatch Support, I need help with the app.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch((err) => {
      console.error("Error opening WhatsApp:", err);
    });
  };

  // ✉️ ඊමේල් යැවීම
  const openEmail = () => {
    Linking.openURL("mailto:support@jumbowatch.com").catch((err) => 
      console.error("Error opening Mail:", err)
    );
  };

  // 📞 දුරකථන ඇමතුම් ලබා ගැනීම
  const openPhone = () => {
    Linking.openURL("tel:+94771234567").catch((err) => 
      console.error("Error opening Dialer:", err)
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Card */}
        <View style={styles.card}>
          <View style={styles.iconBg}>
            <Ionicons name="help-circle" size={36} color="#3f51b5" />
          </View>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            We are here to help you with any issues or questions regarding JumboWatch tracking.
          </Text>
        </View>

        {/* 2. FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📌 Frequently Asked Questions</Text>
          
          <FAQItem 
            question="How does the live tracking work?" 
            answer="The app tracks GPS data in real time from the vehicle's installed physical tracker and updates the server via cellular connection, instantly reflecting on your map dashboard."
          />

          <FAQItem 
            question="What should I do if GPS is not updating?" 
            answer="Please check if the physical tracker device has proper power supply and the SIM card inside has active data. Also, ensure your smartphone has a stable internet connection."
          />

          <FAQItem 
            question="How do I setup geo-fencing alerts?" 
            answer="Go to Vehicle Details page, choose the specific vehicle, and navigate to configuration settings to set up custom boundary alert notification areas."
          />
        </View>

        {/* 3. Contact Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact Support</Text>
          
          {/* Email Shortcut */}
          <TouchableOpacity style={styles.contactRow} onPress={openEmail} activeOpacity={0.6}>
            <Ionicons name="mail-outline" size={20} color="#3f51b5" />
            <Text style={styles.contactText}>support@jumbowatch.com</Text>
          </TouchableOpacity>

          {/* Phone Shortcut */}
          <TouchableOpacity style={styles.contactRow} onPress={openPhone} activeOpacity={0.6}>
            <Ionicons name="call-outline" size={20} color="#3f51b5" />
            <Text style={styles.contactText}>+94 77 123 4567</Text>
          </TouchableOpacity>

          {/* Time Info */}
          <View style={[styles.contactRow, { opacity: 0.7 }]}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={[styles.contactText, { color: '#666' }]}>Working Hours: 9:00 AM - 6:00 PM</Text>
          </View>
        </View>
        
        {/* Extra spacing below */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 4. Floating WhatsApp Button */}
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    color: '#333'
  },
  // FAQ Accordion Styles
  faqWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f4',
    paddingVertical: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswerContainer: {
    marginTop: 8,
    backgroundColor: '#f8f9fc',
    padding: 12,
    borderRadius: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  // Contact Rows
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 12,
    color: '#3f51b5',
    fontWeight: '500'
  },
  // FAB Styles
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#25D366', 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 5 }
    }),
  },
});