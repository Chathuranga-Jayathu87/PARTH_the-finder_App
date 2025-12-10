import react, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { register } from '../../src/services/authService';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !phone) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password, phone);
            Alert.alert("Success", "Registration complete! Please log in.");
            router.replace('/(auth)/Login');
        } catch (err) {
            Alert.alert("Registration Failed.", (err as Error).message);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            
            <Text style={styles.title}>GPS Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
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
            <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor="#888"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <Button title="Register" onPress={handleRegister} disabled={loading} />
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
