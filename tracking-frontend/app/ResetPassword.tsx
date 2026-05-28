import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPassword() {
  // This automatically captures "?token=..." from the email link
  const { token } = useLocalSearchParams(); 

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // const handleUpdate = async () => {
  //   if (password !== confirmPassword) {
  //     Alert.alert("Error", "Passwords do not match.");
  //     return;
  //   }
    
  //   try {
  //     // Call your backend API here
  //     // await updatePasswordApi(token, password);
  //     Alert.alert("Success", "Your password has been reset!", [
  //       { text: "Login", onPress: () => router.replace('/(auth)/Login') }
  //     ]);
  //   } catch (err) {
  //     Alert.alert("Error", "Link may be expired or invalid.");
  //   }
  // };

const handleUpdate = async () => {
  if (!token) {
    Alert.alert("Invalid Link", "Reset link is invalid or expired.");
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

  try {
    await fetch("https://YOUR_API/api/users/pass/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });

    Alert.alert("Success", "Your password has been reset!", [
      { text: "Login", onPress: () => router.replace('/(auth)/Login') }
    ]);
  } catch (err) {
    Alert.alert("Error", "Link may be expired or invalid.");
  }
};





  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Password</Text>
      <Text style={styles.subtitle}>Token received: {token ? "Valid" : "Missing"}</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter New Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#888" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15
  },
  input: { flex: 1, fontSize: 16 },
  button: {
    backgroundColor: '#3f51b5',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});