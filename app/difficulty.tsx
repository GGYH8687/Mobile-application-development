import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Difficulty selection screen.
 * Players pick between Easy, Normal or Hard before entering the game.
 * The chosen difficulty is persisted in AsyncStorage and the player is
 * redirected back to the main game screen.
 */
export default function Difficulty() {
  const router = useRouter();

  /**
   * Navigate to the home screen with the selected difficulty level.
   * We persist the choice in AsyncStorage so the game can load it later.
   */
  const selectDifficulty = async (level: string) => {
    try {
      await AsyncStorage.setItem('@wam_difficulty', level);
    } catch (err) {
      console.warn('Failed to store difficulty', err);
    }
    // Navigate back to the game home page.
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Difficulty</Text>
      <TouchableOpacity style={styles.button} onPress={() => selectDifficulty('Easy')}>
        <Text style={styles.buttonText}>Easy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => selectDifficulty('Normal')}>
        <Text style={styles.buttonText}>Normal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => selectDifficulty('Hard')}>
        <Text style={styles.buttonText}>Hard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});