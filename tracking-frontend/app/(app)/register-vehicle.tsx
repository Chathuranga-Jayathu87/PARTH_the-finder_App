// app/(app)/register-vehicle.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
// Assume you have an API service to register devices
import { registerVehicle } from '../../src/services/vehicleService'; 


export default function RegisterVehicleScreen() {
    const [plate, setPlate] = useState('');
    const [model, setModel] = useState('');
    const [trackerId, setTrackerId] = useState(''); // The unique ID from the physical GPS device
    const [sim_number, setSimnumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!plate || !model || !trackerId) {
            Alert.alert('Error', 'Please fill in all vehicle and tracker details.');
            return;
        }

        const vehicledata = {
            license_plate : plate,
            imei_number : trackerId,
            make_model : model,
            sim_number : String(sim_number),

        };

        setLoading(true);
        try {
            // 🚀 Call your backend API here
             await registerVehicle(vehicledata);
            
            Alert.alert("Success", `Vehicle ${plate} registered successfully!`);
            // Go back to the dashboard after successful registration
            router.replace('/(app)'); 
            
        } catch (error) {
            Alert.alert("Registration Failed", ((error instanceof Error ? error.message : String(error)) || 'Could not connect to service.'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Go back to the previous screen (the dashboard)
        if (router.canGoBack()) {
            router.back();
        } else {
            // Fallback: If somehow the user navigated directly here, replace with the dashboard
            router.replace('/(app)'); 
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Register a New Vehicle</Text>
            
            <TextInput
                style={styles.input}
                placeholder="License Plate (e.g., PBX-1578)"
                placeholderTextColor="#888"
                value={plate}
                onChangeText={setPlate} 
            />
            
            <TextInput
                style={styles.input}
                placeholder="Vehicle Model (e.g., Toyota Hiace)"
                placeholderTextColor="#888"
                value={model}
                onChangeText={setModel}
            />
            
            <TextInput
                style={styles.input}
                placeholder="GPS Tracker IMEI (Unique Device ID)"
                placeholderTextColor="#888"
                value={trackerId}
                onChangeText={setTrackerId}
            />

            <TextInput
                
                style={styles.input}
                placeholder="SIM Number (e.g., 0771234567)"
                placeholderTextColor="#888"
                value={sim_number}
                keyboardType="numeric"
                onChangeText={setSimnumber}
            />

            <Button title={loading ? "Registering..." : "Register Vehicle"} onPress={handleRegister} disabled={loading} />

            <View style={{ marginTop: 15 }}>
                <Button 
                    title="Cancel" 
                    onPress={handleCancel} 
                    color="#FF3B30" // Use a distinct color for contrast
                    disabled={loading}
                />
            </View>
            
           
            {loading && <ActivityIndicator style={{ marginTop: 15 }} size="small" />}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        padding: 20, 
        backgroundColor: '#f5f5f5',
        minHeight: '100%',
    },
    title: { 
        fontSize: 22, 
        fontWeight: 'bold',
        textAlign: 'center', 
        marginBottom: 30,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        borderRadius: 8,
        padding: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
});