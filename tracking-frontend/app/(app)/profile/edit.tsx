import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export default function EditProfileScreen() {
    // These would ideally be initialized with data from your Auth Context or API
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@example.com');
    const [phone, setPhone] = useState('+1 234 567 890');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Function to handle image selection
    const pickImage = async () => {
        // Ask for permission
        const { status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your photos to update your profile picture.');
            return;
        }
        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };



    // const handleSave = () => {
    //     // Logic to update profile via your authService or API
    //     Alert.alert("Success", "Profile updated successfully!", [
    //         { text: "OK", onPress: () => router.back() }
    //     ]);
    // };



    const handleSave = async () => {
        setLoading(true);
        // Simulate API Call
        setTimeout(() => {
            setLoading(false);
            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }, 1500);
    };

    return (
        <ScrollView style={styles.container}>

            {/* Profile Picture Section */}
            <View style={styles.avatarContainer}>
                <View style={styles.imageWrapper}>
                    <Image 
                        source={{ uri: 'https://via.placeholder.com/150' }} 
                        style={styles.avatar} 
                    />
                    <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                    style={styles.input} 
                    value={name} 
                    onChangeText={setName} 
                    placeholder="Enter your name"
                />

                <Text style={styles.label}>Email Address</Text>
                <TextInput 
                    style={styles.input} 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address"
                    placeholder="Enter your email"
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput 
                    style={styles.input} 
                    value={phone} 
                    onChangeText={setPhone} 
                    keyboardType="phone-pad"
                    placeholder="Enter your phone number"
                />

                <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    avatarContainer: { alignItems: 'center', marginVertical: 30 },
    imageWrapper: { position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee' },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3f51b5',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    form: { paddingHorizontal: 25 },
    label: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#3f51b5',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});