// import react, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Link, router } from 'expo-router';
// import { register } from '../../src/services/authService';

// export default function Register() {
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [phone, setPhone] = useState('');
//     const [loading, setLoading] = useState(false);

//     const handleRegister = async () => {
//         if (!name || !email || !password || !phone) {
//             Alert.alert('Error', 'Please fill in all fields.');
//             return;
//         }

//         setLoading(true);
//         try {
//             await register(name, email, password, phone);
//             Alert.alert("Success", "Registration complete! Please log in.");
//             router.replace('/(auth)/Login');
//         } catch (err) {
//             Alert.alert("Registration Failed.", (err as Error).message);
//         }
//         setLoading(false);
//     };

//     return (
//         <View style={styles.container}>
            
//             <Text style={styles.title}>GPS Register</Text>
//             <TextInput
//                 style={styles.input}
//                 placeholder="Name"
//                 placeholderTextColor="#888"
//                 value={name}
//                 onChangeText={setName}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Email"
//                 placeholderTextColor="#888"
//                 keyboardType="email-address"
//                 value={email}
//                 onChangeText={setEmail}
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 placeholderTextColor="#888"
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry
//             />
//             <TextInput
//                 style={styles.input}
//                 placeholder="Phone"
//                 placeholderTextColor="#888"
//                 value={phone}
//                 onChangeText={setPhone}
//                 keyboardType="phone-pad"
//             />
//             <Button title="Register" onPress={handleRegister} disabled={loading} />
//             {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
//         </View>
//     );

// }

// const styles = StyleSheet.create({
//     container: { flex: 1, justifyContent: 'center', padding: 20 },
//     title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         marginBottom: 10,
//         borderRadius: 5,
//         padding: 10,
//         backgroundColor: '#fff',
//         color: '#000',

//     }
// });



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
import { register } from '../../src/services/authService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      Alert.alert("Success", "Registration complete! Please log in.");
      router.replace('/(auth)/Login');
    } catch (err) {
      Alert.alert("Registration Failed.", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="location-sharp" size={50} color="#3f51b5" />
        <Text style={styles.title}>GPS Tracker</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#888"
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#888"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#888"
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

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#888"
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/Login')}>
          <Text style={styles.signInText}>Login here.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#f9f9f9' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  eyeIcon: { padding: 5 },
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
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#666', fontSize: 14 },
  signInText: { color: '#3f51b5', fontWeight: 'bold', fontSize: 14 },
});
