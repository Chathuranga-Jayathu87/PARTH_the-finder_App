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
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { completePasswordReset } from '../src/services/authService'; 

export default function ResetPassword() {
  
  const { token } = useLocalSearchParams<{ token: string }>(); 

  // 📐 TypeScript Explicit Types
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // ⚡ Loading state එකක් එකතු කරා

  const handleUpdate = async () => {
    if (!token) {
      Alert.alert("Invalid Link", "Reset token is missing or expired.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await completePasswordReset(token, password);

      Alert.alert("Success", "Your password has been reset successfully!", [
        { text: "Login Now", onPress: () => router.replace('/(auth)/Login') }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Link may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="key-outline" size={60} color="#3f51b5" />
        <Text style={styles.title}>New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong new password for your account. {"\n"}
          <Text style={{ fontWeight: '600', color: token ? '#4CAF50' : '#f44336' }}>
            Token Status: {token ? "Valid Token Attached" : "Missing Token"}
          </Text>
        </Text>
      </View>

      {/* New Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#888" 
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Reset Button */}
      <TouchableOpacity 
        style={[styles.button, (loading || !token) && { opacity: 0.7 }]} 
        onPress={handleUpdate} 
        disabled={loading || !token} 
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
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
    marginBottom: 40 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 10 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 10, 
    textAlign: 'center', 
    lineHeight: 20 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    color: '#000', 
    fontSize: 16 
  },
  eyeIcon: { 
    padding: 5 
  },
  button: {
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
    marginTop: 15,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
});