import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { requestPasswordReset } from '../../src/services/authService';

export default function ForgotPassword() {
  
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleResetRequest = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
  
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      // 🛠️ TS Error handling fix
      Alert.alert("Error", err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

 
  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-done" size={50} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We have sent password recovery instructions to: {"\n"}
            <Text style={{ fontWeight: 'bold', color: '#333' }}>{email}</Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.loginButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

 
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="lock-open-outline" size={60} color="#3f51b5" />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we will send you instructions to reset your password.
        </Text>
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          keyboardType="email-address"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity 
        style={[styles.loginButton, loading && { opacity: 0.7 }]} 
        onPress={handleResetRequest} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      {/* Back to Login Footer */}
      <TouchableOpacity 
        style={styles.footer} 
        onPress={() => router.back()}
      >
        <Text style={styles.footerText}>Remember password? </Text>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 30,
    backgroundColor: '#f9f9f9' 
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#333',
    marginTop: 10
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 25,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3f51b5',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#3f51b5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  loginText: {
    color: '#3f51b5',
    fontWeight: 'bold',
    fontSize: 14,
  },
});