import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import MoleHole from './components/MoleHole';
// Import styles from the new styles file. This helps satisfy Lab3 Task 5 by
// organizing the project so that styles are defined in a separate file【655735155608768†L58-L62】.
import homeStyles from './styles/homeStyles';

const GRID_SIZE = 3;
const TOTAL_HOLES = GRID_SIZE * GRID_SIZE;

// Difficulty configuration defines how the game behaves under each level.
const DIFFICULTY_CONFIG = {
  Easy: {
    duration: 40,
    spawnInterval: 1200,
    visibleTime: 1000,
    backgroundColor: '#DEF7E6'
  },
  Normal: {
    duration: 30,
    spawnInterval: 1000,
    visibleTime: 800,
    backgroundColor: '#FDE68A'
  },
  Hard: {
    duration: 20,
    spawnInterval: 600,
    visibleTime: 400,
    backgroundColor: '#FCA5A5'
  }
} as const;

type DifficultyLevel = keyof typeof DIFFICULTY_CONFIG;

export default function Home() {
  const router = useRouter();

  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Normal');
  // Game parameters derived from difficulty.
  const [gameDuration, setGameDuration] = useState(
    DIFFICULTY_CONFIG[difficulty].duration
  );
  const [spawnBase, setSpawnBase] = useState(
    DIFFICULTY_CONFIG[difficulty].spawnInterval
  );
  const [visibleBase, setVisibleBase] = useState(
    DIFFICULTY_CONFIG[difficulty].visibleTime
  );
  const [timeLeft, setTimeLeft] = useState(
    DIFFICULTY_CONFIG[difficulty].duration
  );
  const [isRunning, setIsRunning] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [highScore, setHighScore] = useState<number>(0);

  // Track login state.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const spawnTimer = useRef<NodeJS.Timeout | null>(null);
  const moleHideTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  // Ref for background music. We initialise this lazily when the game starts
  // and unload it when the game ends, satisfying Lab3 Task 6’s requirement for
  // background music【655735155608768†L63-L69】.
  const bgm = useRef<Audio.Sound | null>(null);

  // Load resources on mount.
  useEffect(() => {
    loadHighScore();
    loadDifficulty();
    loadLoginStatus();
    return () => clearAllTimers();
  }, []);

  // When difficulty changes, update derived game parameters.
  useEffect(() => {
    setGameDuration(DIFFICULTY_CONFIG[difficulty].duration);
    setSpawnBase(DIFFICULTY_CONFIG[difficulty].spawnInterval);
    setVisibleBase(DIFFICULTY_CONFIG[difficulty].visibleTime);
    if (!isRunning) {
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].duration);
    }
  }, [difficulty]);

  // Countdown logic.
  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    countdownTimer.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => {
      if (countdownTimer.current) clearTimeout(countdownTimer.current);
    };
  }, [isRunning, timeLeft]);

  // Spawn moles at interval based on difficulty.
  useEffect(() => {
    if (!isRunning) return;
    spawnMole();

    const interval = getSpawnInterval();
    spawnTimer.current = setInterval(spawnMole, interval);

    return () => {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
    };
  }, [isRunning, timeLeft, spawnBase, gameDuration]);

  function getSpawnInterval() {
    const progress = (gameDuration - timeLeft) / gameDuration;
    const minInterval = 450;
    return Math.max(minInterval, spawnBase - progress * 600);
  }

  function getMoleVisibleTime() {
    const progress = (gameDuration - timeLeft) / gameDuration;
    const minTime = 300;
    return Math.max(minTime, visibleBase - progress * 500);
  }

  function spawnMole() {
    let index = Math.floor(Math.random() * TOTAL_HOLES);
    if (index === activeIndex) index = (index + 1) % TOTAL_HOLES;
    setActiveIndex(index);

    if (moleHideTimer.current) clearTimeout(moleHideTimer.current);
    const moleTime = getMoleVisibleTime();

    moleHideTimer.current = setTimeout(() => {
      setActiveIndex(null);
    }, moleTime);
  }

  async function loadHighScore() {
    try {
      const v = await AsyncStorage.getItem('@wam_highscore');
      if (v) setHighScore(parseInt(v, 10));
    } catch (err) {
      console.warn('Failed to load high score', err);
    }
  }

  async function saveHighScore(value: number) {
    try {
      await AsyncStorage.setItem('@wam_highscore', String(value));
    } catch (err) {
      console.warn('Failed to save high score', err);
    }
  }

  async function loadDifficulty() {
    try {
      const stored = await AsyncStorage.getItem('@wam_difficulty');
      if (
        stored &&
        (stored === 'Easy' || stored === 'Normal' || stored === 'Hard')
      ) {
        setDifficulty(stored as DifficultyLevel);
      }
    } catch (err) {
      console.warn('Failed to load difficulty', err);
    }
  }

  async function loadLoginStatus() {
    try {
      const u = await AsyncStorage.getItem('@user_logged_in');
      if (u) {
        setIsLoggedIn(true);
        setUserName(u);
      }
    } catch (err) {
      console.warn('Failed to load login status', err);
    }
  }

  function clearAllTimers() {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (moleHideTimer.current) clearTimeout(moleHideTimer.current);
    if (countdownTimer.current) clearTimeout(countdownTimer.current);
  }

  /**
   * Load and play looping background music. If a music instance already
   * exists, it will simply resume playback. The audio file resides in
   * assets/audio/background.wav, which we generated for this lab. This
   * supports Lab3 Task 6 by adding audio to the gameplay【655735155608768†L63-L69】.
   */
  async function playMusic() {
    try {
      // If a music instance already exists, resume playback
      if (bgm.current) {
        await bgm.current.playAsync();
        return;
      }
      const { sound } = await Audio.Sound.createAsync(
        // Use require with a relative path to the generated audio file.
        require('./assets/audio/background.wav'),
        { isLooping: true, shouldPlay: true }
      );
      bgm.current = sound;
    } catch (err) {
      console.warn('Failed to play background music', err);
    }
  }

  /**
   * Pause and unload background music. This is called when the game
   * finishes or the player exits. It ensures resources are released.
   */
  async function stopMusic() {
    if (bgm.current) {
      try {
        await bgm.current.stopAsync();
        await bgm.current.unloadAsync();
      } catch (err) {
        console.warn('Failed to stop background music', err);
      }
      bgm.current = null;
    }
  }

  function startGame() {
    setScore(0);
    setTimeLeft(gameDuration);
    setIsRunning(true);
    setActiveIndex(null);
    // Start background music when the game begins.
    playMusic();
  }

  function endGame() {
    clearAllTimers();
    // Stop background music when the game ends.
    stopMusic();
    setIsRunning(false);
    setActiveIndex(null);

    if (score > highScore) {
      setHighScore(score);
      saveHighScore(score);
      Alert.alert('Game Over', `Score: ${score}\nNew High Score!`);
    } else {
      Alert.alert('Game Over', `Score: ${score}\nHigh Score: ${highScore}`);
    }
  }

  function onHit(index: number) {
    if (!isRunning) return;
    if (index === activeIndex) {
      setScore((s) => s + 1);
      setActiveIndex(null);
    } else {
      setScore((s) => Math.max(0, s - 1));
    }
  }

  function renderGrid() {
    const holes = [] as JSX.Element[];
    for (let i = 0; i < TOTAL_HOLES; i++) {
      holes.push(
        <MoleHole
          key={i}
          index={i}
          isActive={activeIndex === i}
          onHit={onHit}
          disabled={!isRunning}
        />
      );
    }
    return holes;
  }

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('@user_logged_in');
    } catch (err) {
      console.warn('Failed to remove logged in user', err);
    }
    setIsLoggedIn(false);
    setUserName(null);
  }

  function handleChangeDifficulty() {
    router.push('/difficulty');
  }

  async function handleDebug() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter((k) => k.startsWith('@user_'));
      const info = await Promise.all(
        userKeys.map(async (k) => {
          const val = await AsyncStorage.getItem(k);
          const name = k.replace('@user_', '');
          return `${name} | ${val}`;
        })
      );
      console.log('Stored users:', info.join(' ; '));
      Alert.alert('Debug', 'User data printed to console. Check the logs.');
    } catch (err) {
      console.warn('Failed to debug user data', err);
      Alert.alert('Error', 'Failed to retrieve user data.');
    }
  }

  return (
    <View
      style={[
        homeStyles.container,
        { backgroundColor: DIFFICULTY_CONFIG[difficulty].backgroundColor },
      ]}
    >
      <Text style={homeStyles.title}>Whac-A-Mole</Text>

      <View style={homeStyles.infoRow}>
        <Text style={homeStyles.infoText}>Score: {score}</Text>
        <Text style={homeStyles.infoText}>Time: {timeLeft}s</Text>
        <Text style={homeStyles.infoText}>High: {highScore}</Text>
        <Text style={homeStyles.infoText}>Difficulty: {difficulty}</Text>
        {isLoggedIn && userName && (
          <Text style={homeStyles.infoText}>User: {userName}</Text>
        )}
      </View>

      <View style={homeStyles.grid}>{renderGrid()}</View>

      {!isRunning ? (
        <TouchableOpacity style={homeStyles.button} onPress={startGame}>
          <Text style={homeStyles.buttonText}>
            {timeLeft === 0 ? 'Restart' : 'Start Game'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[homeStyles.button, { backgroundColor: '#ef4444' }]}
          onPress={() =>
            Alert.alert('Exit Game', 'Do you really want to quit this round?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: endGame },
            ])
          }
        >
          <Text style={homeStyles.buttonText}>End Game</Text>
        </TouchableOpacity>
      )}

      {isLoggedIn ? (
        <TouchableOpacity style={homeStyles.button} onPress={handleLogout}>
          <Text style={homeStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={homeStyles.button}
            onPress={() => router.push('/login')}
          >
            <Text style={homeStyles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.button}
            onPress={() => router.push('/register')}
          >
            <Text style={homeStyles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.button}
            onPress={async () => {
              try {
                await AsyncStorage.removeItem('@user_logged_in');
              } catch { }
              setIsLoggedIn(false);
              setUserName(null);
              router.push('/');
            }}
          >
            <Text style={homeStyles.buttonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={homeStyles.button} onPress={handleChangeDifficulty}>
        <Text style={homeStyles.buttonText}>Change Difficulty</Text>
      </TouchableOpacity>
      <TouchableOpacity style={homeStyles.button} onPress={handleDebug}>
        <Text style={homeStyles.buttonText}>Debug</Text>
      </TouchableOpacity>

      <Text style={homeStyles.tip}>
        Tip: As time passes, moles appear faster and stay for less time!
      </Text>
    </View>
  );
}

// Note: Styles were moved into a separate file (styles/homeStyles.ts). This
// placeholder remains only to satisfy TypeScript's module resolution and is
// intentionally empty. See Task 5 of Lab 3 for details【655735155608768†L58-L62】.