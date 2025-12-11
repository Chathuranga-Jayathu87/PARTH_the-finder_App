import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';   
import { login } from '../../src/services/authService';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await login(email, password);
            await AsyncStorage.setItem('token', response.token);
            Alert.alert("Success", "Logged in!");

            router.replace('/(app)');// Navigate to main app layout
        } catch (err) {
            Alert.alert("Login Failed.", (err as Error).message);
        } finally{
        setLoading(false);
        }
        
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>GPS Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button title="Login" onPress={handleLogin} disabled={loading} />
            <Text>Not registered?<Link href="/(auth)/Register"> Sign up here.</Link></Text>

            {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
        color: '#000',
    }
});
