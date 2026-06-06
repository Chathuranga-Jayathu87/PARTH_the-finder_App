import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { changePassword } from '../../../src/services/userService'; // API call for changing password

export default function ChangePasswordScreen() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [oldVisible, setOldVisible] = useState(false);
    const [newVisible, setNewVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    /* 📊 PASSWORD STRENGTH CALCULATOR (Real-time & Cached) */
    const strength = useMemo(() => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;
        return score;
    }, [newPassword]);

    /* 🎨 STRENGTH BAR STYLES GENERATOR */
    const strengthStyle = useMemo(() => {
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
    }, [strength]);

    /* 🚀 SUBMIT LOGIC */
    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (strength < 3) {
            Alert.alert('Error', 'Please choose a stronger password');
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
            console.error("Change password error:", error);
            Alert.alert('Error', 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // 🍏 කීබෝඩ් එක ආවම ඉන්පුට් හැංගෙන එක වැළැක්වීමට KeyboardAvoidingView දාමු
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

                {/* Current Password */}
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.inputflex}
                        secureTextEntry={!oldVisible}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Enter current password"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setOldVisible(!oldVisible)} style={styles.eyeButton}>
                        <Ionicons
                            name={oldVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#8e8e93"
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
                        onChangeText={setNewPassword} // 👈 කෙලින්ම ස්ටේට් එකට සෙට් කරා, useMemo එකෙන් ස්ට්‍රෙන්ත් එක බලාගන්නවා
                        placeholder="Enter new password"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setNewVisible(!newVisible)} style={styles.eyeButton}>
                        <Ionicons
                            name={newVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#8e8e93"
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
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setConfirmVisible(!confirmVisible)} style={styles.eyeButton}>
                        <Ionicons
                            name={confirmVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#8e8e93"
                        />
                    </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        strength < 3 && styles.buttonDisabled
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

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#48484a',
        marginBottom: 6
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f7',
        borderWidth: 1,
        borderColor: '#e5e5ea',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 16
    },
    inputflex: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000'
    },
    eyeButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    strengthWrapper: {
        marginBottom: 20,
        marginTop: -6
    },
    strengthBarBackground: {
        height: 5,
        backgroundColor: '#e5e5ea',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden'
    },
    strengthBarActive: {
        height: '100%',
        borderRadius: 3
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 5,
        textAlign: 'right'
    },
    button: {
        backgroundColor: '#3f51b5',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#3f51b5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3
    },
    buttonDisabled: {
        backgroundColor: '#d1d1d6',
        shadowOpacity: 0,
        elevation: 0
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    }
});