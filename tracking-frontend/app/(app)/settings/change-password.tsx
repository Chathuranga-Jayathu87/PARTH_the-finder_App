import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { changePassword } from '@/src/services/userService';
import { router } from 'expo-router';
import {Ionicons} from '@expo/vector-icons';


export default function ChangePasswordScreen() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [IspasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const result = await changePassword(oldPassword, newPassword);
            if (result.success) {
                Alert.alert("Success", "Password changed successfully", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            } else {
                Alert.alert("Error", result.message);
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
            <TextInput 
                style={styles.inputflex} 
                secureTextEntry={!IspasswordVisible}
                value={oldPassword} 
                onChangeText={setOldPassword} 
                placeholder="Enter Current Password"
            />
             <TouchableOpacity onPress={() => setIsPasswordVisible(!IspasswordVisible)} >
                    <Ionicons 
                        name={IspasswordVisible ? "eye-off-outline" : "eye-outline"} 
                        size={22} 
                        color="#666" 
                    />
            </TouchableOpacity> 
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
            <TextInput 
                style={styles.inputflex} 
                secureTextEntry={!IspasswordVisible}
                value={newPassword} 
                onChangeText={setNewPassword}
                placeholder="Enter New Password" 
            />
             <TouchableOpacity onPress={() => setIsPasswordVisible(!IspasswordVisible)}>
                    <Ionicons 
                        name={IspasswordVisible ? "eye-off-outline" : "eye-outline"} 
                        size={22} 
                        color="#666" 
                    />
            </TouchableOpacity>
            </View>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
            <TextInput 
                style={styles.inputflex} 
                secureTextEntry={!IspasswordVisible}
                value={confirmPassword} 
                onChangeText={setConfirmPassword}
                placeholder="Confirm New Password"
                 placeholderTextColor="#888" 
            />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!IspasswordVisible)}>
                    <Ionicons 
                        name={IspasswordVisible ? "eye-off-outline" : "eye-outline"} 
                        size={22} 
                        color="#666" 
                    />
            </TouchableOpacity> 
            </View>
            <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
         },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8 
        },
    button: { 
        backgroundColor: '#3f51b5',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10 
        },
    buttonText: { 
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16 
        },
    passwordContainer: { flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10, },
    inputflex: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        
        },
});