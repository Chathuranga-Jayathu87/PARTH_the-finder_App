import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { changePassword } from '@/src/services/userService';

export default function ChangePasswordScreen() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [oldVisible, setOldVisible] = useState(false);
    const [newVisible, setNewVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const [strength, setStrength] = useState(0);
    const [loading, setLoading] = useState(false);

    const checkPasswordStrength = (pass:string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(score);
        setNewPassword(pass);
    };

   const getStrengthStyles = () => {
    switch (strength) {
        case 1:
            return { color: '#FF3B30', label: 'Weak', width: 25 };
        case 2:
            return { color: '#FF9500', label: 'Fair', width: 50 };
        case 3:
            return { color: '#FFCC00', label: 'Good', width: 75 };
        case 4:
            return { color: '#4CD964', label: 'Strong', width: 100 };
        default:
            return { color: '#E0E0E0', label: 'Very Weak', width: 10 };
    }
};


    const strengthStyle = getStrengthStyles();

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const result = await changePassword(oldPassword, newPassword);
            if (result.success) {
                Alert.alert('Success', 'Password changed successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', result.message || 'Failed to change password');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            {/* Current Password */}
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.inputflex}
                    secureTextEntry={!oldVisible}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="Enter current password"
                />
                <TouchableOpacity onPress={() => setOldVisible(!oldVisible)}>
                    <Ionicons
                        name={oldVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.inputflex}
                    secureTextEntry={!newVisible}
                    value={newPassword}
                    onChangeText={checkPasswordStrength}
                    placeholder="Enter new password"
                />
                <TouchableOpacity onPress={() => setNewVisible(!newVisible)}>
                    <Ionicons
                        name={newVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>

            {/* Strength Indicator */}
            {newPassword.length > 0 && (
                <View style={styles.strengthWrapper}>
                    <View style={styles.strengthBarBackground}>
                       <View
                            style={[
                                styles.strengthBarActive,
                                {
                                    width: `${strengthStyle.width}%`,
                                    backgroundColor: strengthStyle.color
                                }
                            ]}
                        />
                    </View>
                    <Text style={[styles.strengthLabel, { color: strengthStyle.color }]}>
                        {strengthStyle.label}
                    </Text>
                </View>
            )}

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.inputflex}
                    secureTextEntry={!confirmVisible}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                />
                <TouchableOpacity onPress={() => setConfirmVisible(!confirmVisible)}>
                    <Ionicons
                        name={confirmVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
                style={[
                    styles.button,
                    strength < 3 && { backgroundColor: '#aaa' }
                ]}
                onPress={handleChangePassword}
                disabled={loading || strength < 3}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Update Password</Text>
                )}
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10
    },
    inputflex: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333'
    },
    strengthWrapper: {
        marginBottom: 20,
        marginTop: -5
    },
    strengthBarBackground: {
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        width: '100%'
    },
    strengthBarActive: {
        height: 4,
        borderRadius: 2
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'right'
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
    }
});
