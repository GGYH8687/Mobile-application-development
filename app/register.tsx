import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Register() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }

        try {
            const existingUser = await AsyncStorage.getItem(`@user_${username}`);
            if (existingUser) {
                Alert.alert('Error', 'Username already exists');
                return;
            }

            await AsyncStorage.setItem(`@user_${username}`, password);
            Alert.alert('Success', 'Account created successfully');
            router.push('/login'); // Redirect to login page after successful registration
        } catch (error) {
            console.warn('Error saving credentials:', error);
            Alert.alert('Error', 'An error occurred during registration');
        }
    };

    /**
     * Continue without registering or logging in.
     * Clears any logged-in user and goes straight to the game.
     */
    const handleGuest = async () => {
        try {
            await AsyncStorage.removeItem('@user_logged_in');
        } catch (err) {
            console.warn('Failed to clear logged in user', err);
        }
        router.push('/');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.link}
                onPress={() => router.push('/login')} // Navigate to the login screen
            >
                <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
        <TouchableOpacity
            style={styles.link}
            onPress={handleGuest}
        >
            <Text style={styles.linkText}>Continue as Guest</Text>
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    link: {
        alignItems: 'center',
        marginTop: 10,
    },
    linkText: {
        color: '#007BFF',
    },
});
