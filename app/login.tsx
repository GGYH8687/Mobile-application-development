import React, { useState } from 'react';
import { Alert, Button, TextInput, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }

        try {
            const storedPassword = await AsyncStorage.getItem(`@user_${username}`);
            if (storedPassword === password) {
                // Successfully logged in
                Alert.alert('Login Successful', 'Welcome back!');
                router.push('/'); // Navigate to the main game screen
            } else {
                Alert.alert('Error', 'Invalid username or password');
            }
        } catch (error) {
            console.warn('Error loading credentials:', error);
            Alert.alert('Error', 'An error occurred during login');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
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
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.link}
                onPress={() => router.push('/register')} // Navigate to the register screen
            >
                <Text style={styles.linkText}>Don't have an account? Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.link}
                onPress={() => router.push('/')}> // Skip login to play as guest
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
