import { useRouter, useSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MoleHole from './components/MoleHole';

const GRID_SIZE = 3;
const TOTAL_HOLES = GRID_SIZE * GRID_SIZE;
const BASE_SPAWN_INTERVAL = 1000;
const BASE_MOLE_VISIBLE_TIME = 800;

export default function Home() {
  const router = useRouter();
  const { difficulty } = useSearchParams(); // Get the difficulty from the route params

  // Default values for difficulty
  const [gameDuration, setGameDuration] = useState(GAME_DURATION);
  const [spawnInterval, setSpawnInterval] = useState(BASE_SPAWN_INTERVAL);
  const [moleVisibleTime, setMoleVisibleTime] = useState(BASE_MOLE_VISIBLE_TIME);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [highScore, setHighScore] = useState<number>(0);

  const spawnTimer = useRef<NodeJS.Timeout | null>(null);
  const moleHideTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  // Adjust game settings based on difficulty
  useEffect(() => {
    switch (difficulty) {
      case 'Easy':
        setGameDuration(40); // Longer game duration
        setSpawnInterval(1200); // Lower spawn frequency
        setMoleVisibleTime(1000); // Longer visible time
        break;
      case 'Hard':
        setGameDuration(20); // Shorter game duration
        setSpawnInterval(600); // Faster spawn rate
        setMoleVisibleTime(400); // Shorter visible time
        break;
      default:
        setGameDuration(30); // Default normal settings
        setSpawnInterval(BASE_SPAWN_INTERVAL);
        setMoleVisibleTime(BASE_MOLE_VISIBLE_TIME);
        break;
    }
    setTimeLeft(gameDuration); // Reset time when difficulty changes
  }, [difficulty]);

  // Countdown logic
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

  // Spawn moles
  useEffect(() => {
    if (!isRunning) return;
    spawnMole();

    const interval = spawnInterval;
    spawnTimer.current = setInterval(spawnMole, interval);

    return () => {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
    };
  }, [isRunning, timeLeft, spawnInterval]);

  function spawnMole() {
    let index = Math.floor(Math.random() * TOTAL_HOLES);
    if (index === activeIndex) index = (index + 1) % TOTAL_HOLES;
    setActiveIndex(index);

    if (moleHideTimer.current) clearTimeout(moleHideTimer.current);
    moleHideTimer.current = setTimeout(() => {
      setActiveIndex(null);
    }, moleVisibleTime);
  }

  function startGame() {
    setScore(0);
    setTimeLeft(gameDuration);
    setIsRunning(true);
    setActiveIndex(null);
  }

  function endGame() {
    clearAllTimers();
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

  function clearAllTimers() {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (moleHideTimer.current) clearTimeout(moleHideTimer.current);
    if (countdownTimer.current) clearTimeout(countdownTimer.current);
  }

  function renderGrid() {
    const holes = [];
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

  function onHit(index: number) {
    if (!isRunning) return;
    if (index === activeIndex) {
      setScore((s) => s + 1);
      setActiveIndex(null);
    } else {
      setScore((s) => Math.max(0, s - 1));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Whac-A-Mole</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Score: {score}</Text>
        <Text style={styles.infoText}>Time: {timeLeft}s</Text>
        <Text style={styles.infoText}>High: {highScore}</Text>
        <Text style={styles.infoText}>Difficulty: {difficulty}</Text>
      </View>

      <View style={styles.grid}>{renderGrid()}</View>

      {!isRunning ? (
        <TouchableOpacity style={styles.button} onPress={startGame}>
          <Text style={styles.buttonText}>{timeLeft === 0 ? 'Restart' : 'Start Game'}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#ef4444' }]}
          onPress={() =>
            Alert.alert('Exit Game', 'Do you really want to quit this round?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: endGame }
            ])
          }
        >
          <Text style={styles.buttonText}>End Game</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.tip}>Tip: As time passes, moles appear faster and stay for less time!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  tip: {
    marginTop: 12,
    color: '#374151',
  },
});
