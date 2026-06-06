import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { registerVehicle } from '../../src/services/vehicleService'; 

export default function RegisterVehicleScreen() {
  const [plate, setPlate] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [trackerId, setTrackerId] = useState<string>(''); 
  const [sim_number, setSimnumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!plate || !model || !trackerId) {
      Alert.alert('Error', 'Please fill in all vehicle and tracker details.');
      return;
    }

    const vehicledata = {
      name: plate.trim().toUpperCase(),
      license_plate: plate.trim().toUpperCase(), // 🔠 License plate එක හැමතිස්සෙම UpperCase කරනවා
      vehicleNumber: trackerId.trim(),
      imei_number: trackerId.trim(),
      type: model.trim(),
      make_model: model.trim(),
      sim_number: String(sim_number).trim(),
    };

    setLoading(true);
    try {
      await registerVehicle(vehicledata);
      Alert.alert("Success", `Vehicle ${plate.toUpperCase()} registered successfully!`);
      router.replace('/(app)'); 
    } catch (error) {
      Alert.alert("Registration Failed", ((error instanceof Error ? error.message : String(error)) || 'Could not connect to service.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)'); 
    }
  };

  return (
    // 📱 Keyboard එකෙන් Inputs වැසීම වැළැක්වීමට Wrapper එකක් දැම්මා
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Ionicons name="bus-outline" size={50} color="#3f51b5" />
          <Text style={styles.title}>Register a New Vehicle</Text>
          <Text style={styles.subtitle}>Enter the physical GPS tracker and vehicle details below.</Text>
        </View>

        {/* 1. License Plate Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="card-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="License Plate (e.g., PBX-1578)"
            placeholderTextColor="#888"
            autoCapitalize="characters" // ඔටෝමැටිකලි ලොකු අකුරෙන් වදිනවා
            autoCorrect={false}
            value={plate}
            onChangeText={setPlate} 
          />
        </View>

        {/* 2. Vehicle Model Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="car-sport-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Vehicle Model (e.g., Toyota Hiace)"
            placeholderTextColor="#888"
            value={model}
            onChangeText={setModel}
          />
        </View>

        {/* 3. GPS Tracker IMEI Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="barcode-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="GPS Tracker IMEI (Unique ID)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
            value={trackerId}
            onChangeText={setTrackerId}
          />
        </View>

        {/* 4. SIM Number Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="SIM Number (e.g., 0771234567)"
            placeholderTextColor="#888"
            value={sim_number}
            keyboardType="numeric"
            onChangeText={setSimnumber}
          />
        </View>

        {/* 🚀 CUSTOM REGISTER BUTTON */}
        <TouchableOpacity 
          style={[styles.registerButton, loading && { opacity: 0.7 }]} 
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register Vehicle</Text>
          )}
        </TouchableOpacity>

        {/* ❌ CUSTOM CANCEL BUTTON */}
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleCancel}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    padding: 25, 
    backgroundColor: '#f9f9f9', // කලින් පේජ් වල තීම් එකටම ගැලපෙන්න ගත්තා
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
    marginTop: 10
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    textAlign: 'center', 
    color: '#333',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
    lineHeight: 20
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eef0f5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 3 },
      android: { elevation: 1 }
    }),
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    color: '#333', 
    fontSize: 16 
  },
  registerButton: {
    backgroundColor: '#3f51b5',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    ...Platform.select({
      ios: { shadowColor: '#3f51b5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
      android: { elevation: 3 }
    }),
  },
  registerButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  cancelButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eef0f5',
    backgroundColor: '#fff'
  },
  cancelButtonText: { 
    color: '#FF3B30', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});